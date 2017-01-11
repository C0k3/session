'use strict';

const jwt = require('jsonwebtoken'); //https://www.npmjs.com/package/jsonwebtoken
const log = require('../../lib/log');
const token = require('../../lib/token');
const response = require('../../lib/response');
const constants = require('../../lib/constants');

module.exports = function(event, context, cb) {
    token.parseAuthorizationHeader(event.headers[constants.AUTHORIZATION_HEADER])
        .then(token => {
            let at_expiresIn = 0;
            try {
                at_expiresIn = jwt.decode(token).exp - Math.floor(Date.now() / 1000);        
            } catch (err) {
                log.error(err);
                return cb(null, response.create(500, {
                    message:'Error in getting access_token Expiration date' 
                }));
            } 

            if(at_expiresIn <= 0) {
                log.info('received expired token');
                return cb(null, response.create(401, {
                        message : 'access_token expired'                    
                    }));

            } else {    
                return cb(null, response.create(200, { access_token_expires_in: at_expiresIn }));
            }        
        })
        .catch(err => {
            return cb(null, response.create(500, {
                        message : err.message
                    }));
        });    
};