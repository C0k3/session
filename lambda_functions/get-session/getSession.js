'use strict';
var AWS = require('aws-sdk');
var jwt = require('jsonwebtoken'); //https://www.npmjs.com/package/jsonwebtoken
var secret = require('../../lib/generate-secret');
var db = require('../../lib/db');
var log = require('../../lib/log');
var config = require(`../../config/${process.env.NODE_ENV}.json`); 
const CLIENT_ID_HEADER = 'X-koms-clientid';
const AUTHORIZATION_HEADER = 'Authorization';

module.exports = function(event, context, cb) {
    //let code = event.body.janrain_code;
    let clientId = event.headers[CLIENT_ID_HEADER];
    log.info(clientId);
    if (!clientId) throw `${CLIENT_ID_HEADER} request header value is required`;
    let clientSecret = secret(clientId);
    let authorizationToken = event.headers[AUTHORIZATION_HEADER];
    let token = '';
    log.info(authorizationToken);

    //DRY: refactor into common library (shared with authorizer.js)
    if (authorizationToken) {
        let parts = authorizationToken.split(' ');
        if (parts.length == 2) {
            let scheme = parts[0];
            let credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
                log.info(token);
            } else {
                return cb('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' });
            }
        } else {
            return cb('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' })
        }
    } else { 
        return cb('no authorization header found');
    }
    let at_expiresIn =0;
    try {
           at_expiresIn = jwt.decode(token).exp - Math.floor(Date.now() / 1000);
        
        } catch (e) {  
            return cb(null,{message:'Error in getting accessToken Expiry date'+e});
        } 
        if(at_expiresIn<0) {
            var checkException = {
                errorType : "Unauthorized",
                httpStatus : 401,
                requestId : context.awsRequestId,
                message : "Token expired"
            }
            return cb(JSON.stringify(checkException));
        } else {    
           return cb(null,{access_token_expires_in: at_expiresIn});
        }
    };
        