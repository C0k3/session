/*jshint expr: true*/
'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../../util/testHelper'),
    constants = require('../../lib/constants');

describe('getUser', function() {
    beforeEach(function() {
        this.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNDc5MDY5MzkyLCJleHAiOjE0NzkwNzI5OTIsImF1ZCI6IjEyMyIsInN1YiI6ImE3MGZjOWVmLWY0M2QtNDM4YS05OTkwLTNhN2Q5Y2M1ZWZkZXx0cmFkaXRpb25hbCJ9.Rd2bcM2bAPfD3jvTIshQnYPJdEBloFCbPxglruFZ8-g';
        this.user = { Id: '1', Email: 'tets@test.com' };
        this.sinon = sinon.sandbox.create();
        this.event = testHelper.lambdaEvent();
        this.parseAuthorizationHeaderSpy = this.sinon.spy(() => Promise.resolve(this.token));
        this.decodeSpy = this.sinon.spy(() => {
            return { sub: '1' };
        });

        this.dbMock = {
            getUser: this.sinon.spy(() => Promise.resolve(this.user))
        };

        this.getUser = proxyquire('./getUser', {
                '../../lib/log': testHelper.mockLog,
                '../../lib/db': this.dbMock,
                '../../lib/token': {
                    parseAuthorizationHeader: this.parseAuthorizationHeaderSpy
                },
                'jsonwebtoken': {
                    decode: this.decodeSpy
                }
            });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should parse Authorization header', function(done) {
        this.getUser(this.event, {}, (err, data) => {
            testHelper.check(done, () => {                
                assert(this.parseAuthorizationHeaderSpy.calledOnce);
            });
        });
    });

    it('should decode Authorization token', function(done) {
        this.getUser(this.event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert(this.decodeSpy.calledOnce);
                assert(this.decodeSpy.calledWith(this.token));
            });
        });
    });

    it('should return user profile information', function(done) {
        this.getUser(this.event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                assert(this.dbMock.getUser.calledOnce);
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(200);
                expect(body).to.deep.equal({ id: this.user.Id, email: this.user.Email });
            });
        });
    });
});