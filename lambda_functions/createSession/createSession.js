'use strict';
var response = require('../../lib/response');
var db = require('../../lib/db');
var log = require('../../lib/log');
var constants = require('../../lib/constants');
var secrets = require('../../lib/secrets');
var jwt = require('jsonwebtoken');
var config = require(`../../config/${process.env.NODE_ENV}.json`); 

module.exports = function(event, context, cb) {
    let body = JSON.parse(event.body);
    if (!body.account_type) {
        return cb(null, response.create(500, {
            message: 'missing account_type in request'
        }, true));
    }

    let clientId = event.headers[constants.CLIENT_ID_HEADER];

    if (body.account_type === 'traditional') {
        db.getUser(body)
            .then(user => {
                let tokens = createTokens(user.id, clientId);
                //calculate seconds until expiration
                let at_expiresIn = jwt.decode(tokens.access_token).exp - Math.floor(Date.now() / 1000);

                db.saveTokens(tokens.refresh_token,
                    tokens.access_token,
                    user.id,
                    clientId)
                .then(() => {
                    cb(null, response.create(200, {
                        access_token: tokens.access_token,
                        refresh_token: tokens.refresh_token,
                        access_token_expires_in: at_expiresIn
                    }, true));
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
        }, true));
    }
};

function createTokens(userId, clientId) {
    let clientSecret = secrets.clientIdDigest(clientId);
    let tokenOptions = (expiresIn) => {
        return {
            expiresIn: expiresIn,
            subject: userId, 
            audience: clientId
        };
    };

    return {
        refresh_token: jwt.sign({ type: 'refresh' }, clientSecret, tokenOptions(config.RefreshTokenExpiration)),
        access_token: jwt.sign({ type: 'access' }, clientSecret, tokenOptions(config.AccessTokenExpiration))
    };
}
