'use strict';
var jwt = require('jsonwebtoken');
var log = require('../../lib/log');
var token = require('../../lib/token');
var secrets = require('../../lib/secrets');
var constants = require('../../lib/constants');
var authorization = require('../../lib/authorization');

//Custom Authorizer reference: http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html#api-gateway-custom-authorizer-input
module.exports = function(event, context, cb) {

    //NOTE: I'm not happy with the way this is reading - think about using promises to de-clutter
    let clientId = '';
    try {
        clientId = authorization.checkClientId(event.headers[constants.CLIENT_ID_HEADER]);
    } catch (err) {
        log.error(err.message);
        return cb('Fail', {
            name: 'client_id_error',
            message: err.message
        });
    }

    token.parseAuthorizationHeader(event.authorizationToken)
        .then(parsedToken => {
            let decoded = {};
            try {
                //this will throw an invalid signature if the wrong secret were used to sign the request OR if the token has expired
                decoded = jwt.verify(parsedToken, secrets.clientIdDigest(clientId), { audience: clientId });
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
            return cb ('Fail', err);
        });
};
