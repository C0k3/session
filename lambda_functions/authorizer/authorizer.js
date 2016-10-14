'use strict';
var jwt = require('jsonwebtoken');
var AuthPolicy = require('../../lib/AuthPolicy');
var log = require('../../lib/log');
var secret = require('../../lib/generate-secret');
const CLIENT_ID_HEADER = 'X-koms-clientid'; //TODO: refactor this into config or "env var

//Custom Authorizer reference: http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html#api-gateway-custom-authorizer-input
module.exports = function(event, context, cb) {
    let clientId = event.headers[CLIENT_ID_HEADER];
    let token = '';

    //DRY: refactor into common library (shared with getSession.js)
    if (event.authorizationToken) {
        let parts = event.authorizationToken.split(' ');
        if (parts.length == 2) {
            let scheme = parts[0];
            let credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            } else {
                return cb('credentials_bad_scheme', { message: 'Format is Authorization: Bearer [token]' });
            }
        } else {
            return cb('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' })
        }
    } else { 
        return cb('no authorization header found');
    }

    let decoded = {};
    try {
        //this will throw an invalid signature if the wrong secret were used to sign the request OR if the token has expired
        decoded = jwt.verify(token, secret(clientId), { audience: clientId });
    } catch (e) {
        log.error(`error decoding access_token: ${e}`);
        return cb('Unauthorized', e);
    }

    //log.info(`decoded token: ${JSON.stringify(decoded)}`);
    var principalId = decoded.sub;      

    // build apiOptions for the AuthPolicy
    var apiOptions = {};
    var tmp = event.methodArn.split(':');
    var apiGatewayArnTmp = tmp[5].split('/');
    var awsAccountId = tmp[4];
    apiOptions.region = tmp[3];
    apiOptions.restApiId = apiGatewayArnTmp[0];
    apiOptions.stage = apiGatewayArnTmp[1]; 

    // this function must generate a policy that is associated with the recognized principal user identifier.
    // depending on your use case, you might store policies in a DB, or generate them on the fly

    // keep in mind, the policy is cached for 5 minutes by default (TTL is configurable in the authorizer)
    // and will apply to subsequent calls to any method/resource in the RestApi
    // made with the same token

    var policy = new AuthPolicy(principalId, awsAccountId, apiOptions);
    policy.allowAllMethods();
    cb(null, policy.build());    
};
