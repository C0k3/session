'use strict';
var log = require('../../lib/log');
var token = require('../../lib/token');
var db = require('../../lib/db');
var response = require('../../lib/response');
var jwt = require('jsonwebtoken');
var secrets = require('../../lib/secrets');
var token = require('../../lib/token');
var authorization = require('../../lib/authorization');
var constants = require('../../lib/constants');
var bb = require('bluebird');

module.exports = function(event, context, cb) {
    let body = JSON.parse(event.body);
    if(!body.refresh_token) {
        return cb(null, response.create(500, {
            message: 'refresh_token field is not in the request'
        }));
    }

    let secret = secrets.apiIdDigest(event.requestContext.apiId);
    let clientId = '';
    try {
        clientId = authorization.checkClientId(event.headers[constants.CLIENT_ID_HEADER]);
    } catch(err) {
        return cb(null, response.create(500, {
            message: err.message
        }));
    }

    token.parseAuthorizationHeader(event.headers.Authorization)
        .then(parsedToken => {
            bb.join(token.getTimeRemaining(parsedToken, secret), 
                token.getTimeRemaining(body.refresh_token, secret), 
                (at_timeRemaining, rt_timeRemaining) => {
                    return {
                        at_timeRemaining: at_timeRemaining,
                        rt_timeRemaining: rt_timeRemaining
                    };
                })
                .then(times => {
                    db.getTokens(body.refresh_token)
                        .then(item => {                                            
                            if (!item) {
                                return cb(null, response.create(401, {
                                    message: 'session no longer exists'
                                }));
                            }

                            if(!times.rt_timeRemaining) {
                                log.info(`expired refresh_token: ${body.refresh_token}`);
                                return cb(null, response.create(401, {
                                    message: 'refresh_token is expired'
                                }));
                            }

                            if(parsedToken !== item.AccessToken) {
                                return cb(null, response.create(401, {
                                    message: 'can only refresh most recently expired access token'
                                }));
                            }

                            if(times.at_timeRemaining) {
                                return cb(null, response.create(200,
                                {   
                                    access_token: parsedToken,
                                    refresh_token: body.refresh_token,
                                    access_token_expires_in: times.at_timeRemaining
                                }));
                            }

                            let userId = jwt.decode(body.refresh_token).sub;
                            let access_token = token.createAccessToken(userId, clientId, event.requestContext.apiId, process.env.ACCESS_TOKEN_EXPIRATION);
                            db.saveTokens(body.refresh_token, access_token, userId, clientId)
                                .then(() => {
                                    return cb(null, response.create(200,
                                    {   
                                        access_token: access_token,
                                        refresh_token: body.refresh_token,
                                        access_token_expires_in: jwt.decode(access_token).exp - Math.floor(Date.now() / 1000)
                                    }));
                                })
                                .catch(err => {
                                    log.error(err);
                                    return cb(null, response.genericError());
                                });
                        })
                        .catch(err => {
                            log.error(err);
                            return cb(null, response.genericError());
                        });
                })
                .catch(err => {
                    log.error(err);
                    return cb(null, response.genericError());
                });
        })
        .catch(err => {
            log.error(err);
            cb(null, response.create(500,
            {
                name: err.name,
                message: err.message
            }));
        });
};