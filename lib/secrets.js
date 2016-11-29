'use strict';
var forge = require('node-forge');

//NOTE: DO NOT STORE SALT IN CODE --> this is for demo puposes only
//in production consider an encrypted value in code and store the decryption key in AWS KMS
const apiIdSalt = '{apiId_salt}';
const passwordSalt = '{password_salt}';

module.exports = {
    apiIdDigest: function(apiId) {
        let md = forge.md.sha256.create();
        md.update(apiId + apiIdSalt);
        return md.digest().toHex();
    },
    passwordDigest: function(password) {
        let md = forge.md.sha256.create();
        md.update(password + passwordSalt);
        return md.digest().toHex();
    } 
};