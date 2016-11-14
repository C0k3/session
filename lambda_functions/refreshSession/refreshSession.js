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
var config = require(`../../config/${process.env.NODE_ENV}.json`);

module.exports = function(event, context, cb) {
    let body = JSON.parse(event.body);
    if(!body.refresh_token) {
        return cb(null, response.create(500, {
            message: 'refresh_token field is not in the request'
        }));
    }

    //TODO: nested promises need some cleanup
    let secret = secrets.apiIdDigest(event.requestContext.apiId);
    let clientId = authorization.checkClientId(event.headers[constants.CLIENT_ID_HEADER]);
    token.parseAuthorizationHeader(event.headers.Authorization)
        .then(parsedToken => {
            token.getExpiration(parsedToken, secret)
                .then(expiration => {
                    if(expiration) {
                        return cb(null, response.create(200,
                        {   
                            access_token: parsedToken,
                            refresh_token: body.refresh_token,
                            access_token_expires_in: expiration
                        }, true));
                    } else {
                        token.getExpiration(body.refresh_token, secret)
                            .then(expiration => {
                                if(expiration) {
                                    let userId = jwt.decode(body.refresh_token).sub;
                                    let access_token = token.createAccessToken(userId, clientId, event.requestContext.apiId, config.AccessTokenExpiration);

                                    db.getTokens(body.refresh_token)
                                        .then(item => {
                                            if (!item) {
                                                return cb(null, response.create(401, {
                                                    message: 'session no longer exists'
                                                }, true));
                                            }

                                            db.saveTokens(body.refresh_token, access_token, userId, clientId)
                                                .then(() => {
                                                    return cb(null, response.create(200,
                                                    {   
                                                        access_token: access_token,
                                                        refresh_token: body.refresh_token,
                                                        access_token_expires_in: jwt.decode(access_token).exp - Math.floor(Date.now() / 1000)
                                                    }, true));
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

                                } else {
                                    log.info(`expired refresh_token: ${body.refresh_token}`);
                                    cb(null, response.create(401, {
                                        message: 'refresh_token is expired'
                                    }));
                                }
                            })
                            .catch(err => {
                                log.error(err);
                                return cb(null, response.genericError());
                            }); 
                    }
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
            }, true));
        });
};