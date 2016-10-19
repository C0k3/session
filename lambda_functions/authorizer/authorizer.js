'use strict';
var jwt = require('jsonwebtoken');
var AuthPolicy = require('../../lib/AuthPolicy');
var log = require('../../lib/log');
var token = require('../../lib/token');
var secret = require('../../lib/generate-secret');
var constants = require('../../lib/constants');

//Custom Authorizer reference: http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html#api-gateway-custom-authorizer-input
module.exports = function(event, context, cb) {
    let clientId = event.headers[constants.CLIENT_ID_HEADER];    

    token.parseAuthorizationHeader(event.authorizationToken)
        .then(parsedToken => {
            let decoded = {};
            try {
                //this will throw an invalid signature if the wrong secret were used to sign the request OR if the token has expired
                decoded = jwt.verify(parsedToken, secret(clientId), { audience: clientId });
            } catch (e) {
                log.error(`error decoding access_token: ${e}`);
                return cb('Unauthorized', e);
            }

            //log.info(`decoded token: ${JSON.stringify(decoded)}`);
            let principalId = decoded.sub;      

            // build apiOptions for the AuthPolicy
            let apiOptions = {};
            let tmp = event.methodArn.split(':');
            let apiGatewayArnTmp = tmp[5].split('/');
            let awsAccountId = tmp[4];
            apiOptions.region = tmp[3];
            apiOptions.restApiId = apiGatewayArnTmp[0];
            apiOptions.stage = apiGatewayArnTmp[1];

            // this function must generate a policy that is associated with the recognized principal user identifier.
            // depending on your use case, you might store policies in a DB, or generate them on the fly

            let policy = new AuthPolicy(principalId, awsAccountId, apiOptions);
            policy.allowAllMethods();
            cb(null, policy.build());  
        })
        .catch(err => {
            return cb ('Fail', err);
        });
};
