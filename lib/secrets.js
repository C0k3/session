'use strict';
var forge = require('node-forge');

//NOTE: DO NOT STORE SALT IN CODE --> this is for demo puposes only - in production consider AWS KMS
const apiIdSalt = '{apiId_salt}';
const passwordSalt = '{password_salt}';

module.exports = {
    apiIdDigest: function(clientId) {
        let md = forge.md.sha256.create();
        md.update(clientId + apiIdSalt); //secrets shouldn't be generated from client id alone
        return md.digest().toHex();
    },
    passwordDigest: function(password) {
        let md = forge.md.sha256.create();
        md.update(password + passwordSalt);
        return md.digest().toHex();
    } 
};