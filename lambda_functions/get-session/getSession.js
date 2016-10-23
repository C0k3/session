'use strict';
import jwt from 'jsonwebtoken'; //https://www.npmjs.com/package/jsonwebtoken
import log from 'lib/log';
import token from 'lib/token';
import response from 'lib/response';
// const config from `../../config/${process.env.NODE_ENV}.json`;
import constants from 'lib/constants';

module.exports = function(event, context, cb) {    
    
    token.parseAuthorizationHeader(event.headers[constants.AUTHORIZATION_HEADER])
        .then(token => {
            let at_expiresIn = 0;
            try {
                at_expiresIn = jwt.decode(token).exp - Math.floor(Date.now() / 1000);        
            } catch (e) {
                log.error(e);
                return cb(null, response(500, {
                    message:'Error in getting accessToken Expiry date' 
                }, true));
            } 

            if(at_expiresIn < 0) {
                log.info('received expired token');
                return cb(null, response(401, {
                        requestId : context.awsRequestId,
                        message : 'Token expired'                    
                    }, true));

            } else {    
                return cb(null, response(200, { access_token_expires_in: at_expiresIn }, true));
            }        
        })
        .catch(err => {

            return cb(null, response(500, {
                        requestId : context.awsRequestId,
                        message : err.message
                    }, true));
        });    
};