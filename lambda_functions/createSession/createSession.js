'use strict';
var response = require('../../lib/response');
var db = require('../../lib/db');
var log = require('../../lib/log');
var constants = require('../../lib/constants');
var secrets = require('../../lib/secrets');
var jwt = require('jsonwebtoken');
var token = require('../../lib/token');
var config = require(`../../config/${process.env.STAGE}`);

module.exports = function(event, context, cb) {
    let body = JSON.parse(event.body);
    if (!body.account_type) {
        return cb(null, response.create(500, {
            message: 'missing account_type in request'
        }));
    }

    let clientId = event.headers[constants.CLIENT_ID_HEADER];
    let apiId = event.requestContext.apiId;

    if (body.account_type === 'traditional') {
        db.getUser(body)
            .then(user => {
                if(!user) {
                    return cb(null, response.create(500, {
                        message: 'user not found'
                    }));
                }

                //TODO: check Tokens table to see if there is already a current session before creating a new one - use user.Id

                let tokens = createTokens(user.Id, clientId, apiId);
                //calculate seconds until expiration
                let at_expiresIn = jwt.decode(tokens.access_token).exp - Math.floor(Date.now() / 1000);

                db.saveTokens(tokens.refresh_token,
                    tokens.access_token,
                    user.Id,
                    clientId)
                .then(() => {
                    cb(null, response.create(200, {
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        access_token_expires_in: at_expiresIn
                    }));
                })
                .catch(err => {
                    log.error(err);
                    cb(null, response.genericError());
                }); 
            })
            .catch(err => {
                log.error(err);
                cb(null, response.genericError());
            });        
    } else if (body.account_type === 'facebook') {
        //TODO: implement - get access_token from request and callout to FB to validate
        //then: get UserId from FB and upsert to User table in DynamoDB
    } else {
        return cb(null, response.create(500, {
            message: 'unsupported account_type'
        }));
    }
};

function createTokens(userId, clientId, apiId) {
    return {
        refresh_token: token.createRefreshToken(userId, clientId, apiId, config.RefreshTokenExpiration),
        access_token: token.createAccessToken(userId, clientId, apiId, config.AccessTokenExpiration)
    };
}
