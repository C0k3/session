/*jshint expr: true*/
'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../../util/testHelper'),
    constants = require('../../lib/constants'),
    jwt = require('jsonwebtoken'),
    secrets = require('../../lib/secrets');

describe('refreshSession', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.createEvent = (isFresh) => {            
            let d = new Date();
            if (isFresh) d.setFullYear(d.getFullYear() + 1);
            else d.setFullYear(d.getFullYear() - 1);
            
            let expiration = Math.floor(d / 1000);
            let token = jwt.sign({}, secrets.apiIdDigest(testHelper.lambdaEvent().requestContext.apiId), { expiresIn: expiration });

            let event = testHelper.lambdaEvent({ refresh_token: token });
            event.headers[constants.AUTHORIZATION_HEADER] = `Bearer ${token}`;

            return event;
        };

        this.verifySpy = this.sinon.spy(jwt.verify);

        this.refreshToken = proxyquire('./refreshSession', {
            '../../lib/log': testHelper.mockLog,
            'jsonwebtoken': {
                verify: this.verifySpy
            }
        });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should verify whether access_token is expired', function(done) {
        let event = this.createEvent(true);
        let eventBody = JSON.parse(event.body);
        let access_token = event.headers[constants.AUTHORIZATION_HEADER].split(' ')[1];
        this.refreshToken(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                //assert(this.verifySpy.calledOnce, 'verify must be called');
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(200);
                expect(body.refresh_token).to.equal(eventBody.refresh_token);
                expect(body.access_token).to.equal(access_token);
                expect(body.access_token_expires_in).to.be.a('Number');
            });
        });
    });

    it('should return error if refresh_token is not in the request', function(done) {
        this.refreshToken(testHelper.lambdaEvent(), {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal('refresh_token field is not in the request');
            });
        });
    });
/*

    it('should replace expired access_token with a valid refresh_token', function(done) {
    
    });

    it('should validate refresh_token', function(done) {

    });*/
});