/*jshint expr: true*/
'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
const testHelper = require('../../util/testHelper');
const constants = require('../../lib/constants');

describe('createSession', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();

        this.dbMock = {
            getUser: this.sinon.spy(() => Promise.resolve({Id: '1'})),
            saveTokens: this.sinon.spy(() => Promise.resolve())
        };

        this.createSession = emptyUser => {
            if (emptyUser) {
                this.dbMock.getUser = this.sinon.spy(() => Promise.resolve(undefined));
            }
            
            return proxyquire('./createSession', {
                '../../lib/log': testHelper.mockLog,
                '../../lib/db': this.dbMock
            });
        };
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should throw an error if account_type is missing in the request', function(done) {
        let event = testHelper.lambdaEvent();
        this.createSession()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).is.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal('missing account_type in request');
            });
        });
    });

    it('should get user from database for traditional account types', function(done) {
        let event = testHelper.lambdaEvent({account_type: 'traditional'});
        this.createSession()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                assert(this.dbMock.getUser.calledOnce);
            });
        });
    });

    it('should save token for traditional account types', function(done) {
        let event = testHelper.lambdaEvent({account_type: 'traditional'});
        this.createSession()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                assert(this.dbMock.saveTokens.calledOnce, 'db.saveTokens should be called once');
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(200);
                expect(body.access_token).to.not.be.null;
                expect(body.refresh_token).to.not.be.null;
                expect(body.access_token_expires_in).to.equal(3600);
            });
        });
    });

    it('should return error for unsupported account types', function(done) {
        let event = testHelper.lambdaEvent({account_type: 'instagram'});
        this.createSession()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal('unsupported account_type');
            });
        });
    });

    it('should return error for non-existing user', function(done) {
        let event = testHelper.lambdaEvent({account_type: 'traditional'});
        this.createSession(true)(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal('user not found');
            });
        });
    });
});