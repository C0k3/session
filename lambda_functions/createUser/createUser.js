'use strict';
var log = require('../../lib/log');
var response = require('../../lib/response');
var secrets = require('../../lib/secrets');

module.exports = function(event, context, cb) {
    //TODO: get username and password from response, has password and store in database
    //NOTE: need to validate client Id

    try {
        let body = JSON.parse(event.body);

        if (body.username === undefined || body.password === undefined || body.username === '' || body.password === '') {
            log.info(`username or password missing in request: ${body}`);
            return cb(null, response(500, {
                name: 'InvalidUsernameOrPassword', //DRY: consider using a shared error type
                message: 'The username or password was not provided'
            }, true))
        }

        //thanks: https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
        let strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
        if (!strongPassword.test(body.password)) {
            return cb(null, response(500, {
                name: 'InvalidUsernameOrPassword',
                message: 'Weak password strength'
            }, true))
        }

        let hashedPassword = secrets.passwordDigest(body.password);

        //TODO: save to database; test for exsiting record first
        //for traditional account: create uuid
        //for social accounts - account id/user id
        
        //QUESTION: should use a partition/sort value? id|IdP ?
        //answer: account merges will guide me?

        return cb(null, response(200, {
                    message: 'new user created' 
                }, true));

    } catch(err) {
        log.error(err);
        return cb(null, response(500, {
                    message: 'server error' 
                }, true));
    }

}