'use strict';
var constants = require('../../lib/constants');
var log = require('../../lib/log');
var authorization = require('../../lib/authorization');

module.exports = function(event, context, cb) {

    let clientId = '';
    try {
        clientId = authorization.checkClientId(event.authorizationToken);
    } catch (err) {
        log.error(err);
        return cb('Fail', {
            name: 'client_id_error',
            message: err.message
        });
    }

    let policy = authorization.createAuthPolicy(event, clientId);
    policy.allowAllMethods();
    cb(null, policy.build());
}
