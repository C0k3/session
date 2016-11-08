'use strict';
var log = require('../../lib/log');
var response = require('../../lib/response');
var secrets = require('../../lib/secrets');
var db = require('../../lib/db');
var constants = require('../../lib/constants');

module.exports = function(event, context, cb) {
    try {
        let body = JSON.parse(event.body);

        if (!body.email || !body.password) {
            log.info(`email or password missing in request: ${body}`);
            return cb(null, response.create(500, {
                name: 'InvalidEmailOrPassword', //DRY: consider using a shared error type
                message: 'The email or password was not provided'
            }, true));
        }

        //thanks: https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
        let strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
        if (!strongPassword.test(body.password)) {
            return cb(null, response.create(500, {
                name: 'InvalidEmailOrPassword',
                message: 'Weak password strength'
            }, true));
        }

        //this: https://davidcel.is/posts/stop-validating-email-addresses-with-regex/
        let emailFormat = /.+@.+\..+/i;
        if (!emailFormat.test(body.email)) {
            return cb(null, response.create(500, {
                name: 'InvalidEmailOrPassword',
                message: 'Invalid email format'
            }, true));
        }

        db.getUser(body)
            .then(user => {
                if(user.Id) {
                    return cb(null, response.create(200, {
                            message: 'user already exists' 
                        }, true));
                }
                
                db.saveUser(body, event.headers[constants.CLIENT_ID_HEADER])
                    .then(() => {
                        return cb(null, response.create(200, {
                            message: 'new user created' 
                        }, true));
                    })
                    .catch(err => {
                        log.error(err);
                        cb(null, response.genericError());
                    });
            })
            .catch(err => {
                log.error(err);
                cb(null, response.genericError());
            });        
        
        //QUESTION: should use a partition/sort value? id|IdP ?
        //answer: account merges will guide me?        

    } catch(err) {
        log.error(err);
        cb(null, response.genericError());
    }
};