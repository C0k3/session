'use strict';
var forge = require('node-forge');

module.exports = function(clientId) {
    let md = forge.md.sha256.create();
    //TODO: figure out where this salt should be stored - it can't be left in the code
    let salt = 'c0k3isi1!'; //secrets shouldn't be generated from client id alone
    md.update(clientId + salt); 

    return md.digest().toHex();
};