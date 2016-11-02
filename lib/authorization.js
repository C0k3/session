'use strict';
var constants = require('./constants');

module.exports = {
    getClientId: function(event) {
        let clientId = event.headers[constants.CLIENT_ID_HEADER];

        if (!clientId) {
            throw`${constants.CLIENT_ID_HEADER} key missing in request header`;            
        }

        return clientId;
    },
    createAuthPolicy: function(event, principleId) {
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

        return new AuthPolicy(principalId, awsAccountId, apiOptions);
    }
};