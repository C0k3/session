'use strict';
var forge = require('node-forge');

//TODO: encrypt salt values in configs - use AWS KMS to decrypt before creating digests
module.exports = {
    apiIdDigest: function(apiId) {
        let md = forge.md.sha256.create();
        md.update(apiId + process.env.API_ID_SALT);
        return md.digest().toHex();
    },
    passwordDigest: function(password) {
        let md = forge.md.sha256.create();
        md.update(password + process.env.PASSWORD_SALT);
        return md.digest().toHex();
    } 
};