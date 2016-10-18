'use strict';
var jwt = require('jsonwebtoken'); //https://www.npmjs.com/package/jsonwebtoken
var log = require('../../lib/log');
var token = require('../../lib/token');
var response = require('../../lib/response');
var config = require(`../../config/${process.env.NODE_ENV}.json`); 
const AUTHORIZATION_HEADER = 'Authorization';

module.exports = function(event, context, cb) {    
    let authorizationToken = event.headers[AUTHORIZATION_HEADER];
    
    token.parseAuthorizationHeader(event.headers[AUTHORIZATION_HEADER])
        .then(token => {
            let at_expiresIn = 0;
            try {
                at_expiresIn = jwt.decode(token).exp - Math.floor(Date.now() / 1000);        
            } catch (e) {  
                return cb(e,{ message:'Error in getting accessToken Expiry date' + e });
            } 

            if(at_expiresIn < 0) {

                return cb(null, response(401, {
                        requestId : context.awsRequestId,
                        message : 'Token expired' 
                    }));

            } else {    
                return cb(null, response(200, { access_token_expires_in: at_expiresIn, subject: token.subject }));
            }        
        })
        .catch(err => {

            return cb(null, response(500, {
                        requestId : context.awsRequestId,
                        message : err.message
                    }));
        });    
};