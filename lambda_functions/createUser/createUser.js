'use strict';
var log = require('../../lib/log');

module.exports = function(event, context, cb) {
    //TODO: get username and password from response, has password and store in database
    //NOTE: need to validate client Id

    try {
        let body = JSON.parse(event.body);

    } catch(err) {        
        cb('server error', log.error(err));
    }

}