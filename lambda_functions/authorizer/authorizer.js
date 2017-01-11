'use strict';

const jwt = require('jsonwebtoken');
const log = require('../../lib/log');
const token = require('../../lib/token');
const secrets = require('../../lib/secrets');
const constants = require('../../lib/constants');
const authorization = require('../../lib/authorization');

//Custom Authorizer reference: http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html#api-gateway-custom-authorizer-input
module.exports = function(event, context, cb) {

    //AWS doesn't expose request headers OR the API Gateway API key to custom authorizers
    //thus, I can't use a clientId sent in from the request to sign the JWT
    //instead: parse API id from event.methodArn and use this to sign the token
    //e.g.: "arn:aws:execute-api:us-east-1:...5....:123zzzz/patrick/GET/session"
    let apiId = event.methodArn.split(':')[5].split('/')[0];

    token.parseAuthorizationHeader(event.authorizationToken)
        .then(parsedToken => {

            //TODO: query DynamoDB with access_token to ensure that the session hasn't been deleted
            
            let decoded = {};
            try {
                //this will throw an invalid signature if the wrong secret were used to sign the request OR if the token has expired
                decoded = jwt.verify(parsedToken, secrets.apiIdDigest(apiId));
            } catch (e) {
                log.error(`error decoding access_token: ${e}`);
                return cb('Unauthorized', e);
            }

            let principalId = decoded.sub;
            let policy = authorization.createAuthPolicy(event, principalId);
            policy.allowAllMethods();
            cb(null, policy.build());
        })
        .catch(err => {
            log.error(err);
            return cb ('Fail', err);
        });
};
