'use strict';

const log = require('../../lib/log');
const token = require('../../lib/token');
const db = require('../../lib/db');
const response = require('../../lib/response');
const jwt = require('jsonwebtoken');

module.exports = function(event, context, cb) { 
    token.parseAuthorizationHeader(event.headers.Authorization)
        .then(token => {
            let userId = jwt.decode(token).sub;
            db.getUser({id: userId})
                .then(user => {                    
                    cb(null, response.create(200, {
                        id: user.Id,
                        email: user.Email
                    }));
                })
                .catch(err => {
                    log.error(err);
                    cb(null, response.genericError());
                });
        })
        .catch(err => {
            log.error(err);
            cb(null, response.create(500,
            {
                name: err.name,
                message: err.message
            }));
        });
};