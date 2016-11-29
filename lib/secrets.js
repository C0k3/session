'use strict';
var forge = require('node-forge');
var config = require(`../config/${process.env.STAGE}`);

//TODO: encrypt salt values in configs - use AWS KMS to decrypt before creating digests

module.exports = {
    apiIdDigest: function(apiId) {
        let md = forge.md.sha256.create();
        md.update(apiId + config.ApiIdSalt);
        return md.digest().toHex();
    },
    passwordDigest: function(password) {
        let md = forge.md.sha256.create();
        md.update(password + config.PasswordSalt);
        return md.digest().toHex();
    } 
};