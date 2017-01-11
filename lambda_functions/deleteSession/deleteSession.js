'use strict';

const log = require('../../lib/log');
const db = require('../../lib/db');
const response = require('../../lib/response');

module.exports = function(event, context, cb) {
    let body = JSON.parse(event.body);

    if(!body.refresh_token) {
        return cb(null, response.create(500, {
            message: 'refresh_token is required'
        }));
    }

    db.deleteTokens(body.refresh_token)
    .then(() => {
        cb(null, response.create(200,{
            message: 'session ended'
        }));
    })
    .catch(err => {
        log.error(log);
        cb(null, response.genericError());
    });
};