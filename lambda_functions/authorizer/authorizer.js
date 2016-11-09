'use strict';
var jwt = require('jsonwebtoken');
var log = require('../../lib/log');
var token = require('../../lib/token');
var secrets = require('../../lib/secrets');
var constants = require('../../lib/constants');
var authorization = require('../../lib/authorization');

//Custom Authorizer reference: http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html#api-gateway-custom-authorizer-input
module.exports = function(event, context, cb) {

    //AWS doesn't expose request headers OR the API Gateway API key to custom authorizers
    //thus, I can't use a clientId sent in from the request to sign the JWT
    //instead: parse API id from event.methodArn and use this to sign the token
    //e.g.: "arn:aws:execute-api:us-east-1:...5....:123zzzz/patrick/GET/session"
    let apiId = event.methodArn.split(':')[5].split('/')[0];

    token.parseAuthorizationHeader(event.authorizationToken)
        .then(parsedToken => {
            //console.log(`parsed token: ${parsedToken}`);
            let decoded = {};
            try {
                //this will throw an invalid signature if the wrong secret were used to sign the request OR if the token has expired
                decoded = jwt.verify(parsedToken, secrets.apiIdDigest(apiId));
            } catch (e) {
                log.error(`error decoding access_token: ${e}`);
                return cb('Unauthorized', e);
            }

            let principalId = decoded.sub;
            //console.log('principal id:' + principalId);
            let policy = authorization.createAuthPolicy(event, principalId);
            policy.allowAllMethods();
            //console.log(JSON.stringify(policy.build()));
            cb(null, policy.build());
        })
        .catch(err => {
            log.error(err);
            return cb ('Fail', err);
        });
};
