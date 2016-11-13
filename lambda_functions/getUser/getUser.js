'use strict';
var log = require('../../lib/log');
var token = require('../../lib/token');
var db = require('../../lib/db');
var response = require('../../lib/response');
var jwt = require('jsonwebtoken');

module.exports = function(event, context, cb) {    
    token.parseAuthorizationHeader(event.headers.Authorization)
        .then(token => {
            let userId = jwt.decode(token).sub;
            db.getUser({id: userId})
                .then(user => {
                    //TODO: DRY with createSession.js                    
                    if(!user) {
                        return cb(null, response.create(500, {
                            message: 'user not found'
                        }, true));
                    }

                    cb(null, response.create(200, {
                        id: user.Id,
                        email: user.Email
                    }), true);
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
            }), true);
        });
};