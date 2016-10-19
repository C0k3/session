'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../../util/testHelper'),
    constants = require('../../lib/constants');

var authorizer = require('./authorizer');

describe('authorizer', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.event = testHelper.lambdaEvent;
        this.makeProxy = (secret) => {
            let fakes = {
                '../../lib/log': {
                    error: () => { return; }
                }   
            };

            if (secret) {
                fakes['../../lib/generate-secret'] = (clientId) => {
                    return 'secret';
                };
            }

            return proxyquire('./authorizer', fakes);
        };
        
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should throw an error if no Authorization header is in the request', function(done) {
        //run and verify
        authorizer(this.event, {}, (err, data) => {
            testHelper.check(done, () => {                
                assert.equal(err, 'Fail');
                assert.equal(data.name, 'no_header');
                assert.equal(data.message, 'no authorization header found');
            });
        });
    });

    it('should throw an error if Authorization header value is not formatted as "[scheme] [token]"', function(done) {
        this.event.authorizationToken = 'whatevs';

        //run and verify
        authorizer(this.event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert.equal(err, 'Fail');
                assert.equal(data.name, 'credentials_bad_format');
                assert.equal(data.message, 'Format is Authorization: Bearer [token]');
            });
        });        
    });

    it('should throw an error if Authorization header value is not formatted as "Bearer [token]"', function(done) {
        this.event.authorizationToken = 'blah 1234';

        //run and verify
        authorizer(this.event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert.equal(err, 'Fail');
                assert.equal(data.name, 'credentials_bad_scheme');
                assert.equal(data.message, 'Format is Authorization: Bearer [token]');
            });
        });        
    });

    it('should return an "Unauthorized" error if access_token is malformed', function(done) {
        this.event.authorizationToken = 'Bearer 1234';

        let proxy = this.makeProxy();

        //run and verify
        proxy(this.event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert.equal(err, 'Unauthorized');
                assert.equal(data.name, 'JsonWebTokenError');
                assert.equal(data.message, 'jwt malformed');
            });
        });        
    });

    it('should return an "Unauthorized" error if access_token has an invalid signature', function(done) {
        //NOTE: this is a jwt signed with the literal string 'secret' - there is no expiration set
        this.event.authorizationToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

        let proxy = this.makeProxy();

        //run and verify
        proxy(this.event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert.equal(err, 'Unauthorized');
                assert.equal(data.name, 'JsonWebTokenError');
                assert.equal(data.message, 'invalid signature');
            });
        });   
    });

    it('should return an "Unauthorized" error if access_token was signed with a different client id', function(done) {
        this.event.authorizationToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0NzE0NjUwOTAsImF1ZCI6IjY3ODQ5In0.3rBsPl94pesw70b4u1BugCxTitxFuVM0VZrt7ahDQJg';

        let proxy = this.makeProxy('secret');

        //run and verify
        proxy(this.event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert.equal(err, 'Unauthorized');
                assert.equal(data.name, 'JsonWebTokenError');
                assert.equal(data.message, 'jwt audience invalid. expected: 12345');
            });
        });  
    });

    it('should return an "Unauthorized" error if access_token has expired', function(done) {        
        //go to https://jwt.io and use this payload to render token:
        /*
            {
              "iat": 1471465090,
              "exp": 265334400, //NOTE: expiration set to 5/30/1978
              "aud": "12345"
            }
        */

        //setup
        this.event.authorizationToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE0NzE0NjUwOTAsImV4cCI6MjY1MzM0NDAwLCJhdWQiOiIxMjM0NSJ9.zzCVcGQzkZdn3z5POuXR4tSEVV1O4LxzcxFusg4qN0o';
        this.event.methodArn = 'arn:aws:execute-api:us-east-1:665342856034:rp8p7288o0/*/GET/session';

        let proxy = this.makeProxy('secret');

        //run and verify
        proxy(this.event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert.equal(err, 'Unauthorized');
                assert.equal(data.name, 'TokenExpiredError');
                assert.equal(data.message, 'jwt expired');
            });
        });   
    });

    it('should throw an error if client id is missing in the header', function(done) {
        //setup
        this.event.headers = {};
        let proxy = this.makeProxy();

        //run and verify
        proxy(this.event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert.equal(err, 'Fail');
                assert.equal(data.name, 'missing_client_id');
                assert.equal(data.message, `${constants.CLIENT_ID_HEADER} key missing in request header`);
            });
        });

    });
});