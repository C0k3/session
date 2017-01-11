/*jshint expr: true*/
'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
const testHelper = require('../../util/testHelper');

describe('deleteSession', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.dbMock = {
            deleteTokens: this.sinon.spy(() => Promise.resolve())
        };
        this.deleteSession = proxyquire('./deleteSession', {
            '../../lib/log': testHelper.mockLog,
            '../../lib/db': this.dbMock
        });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should delete tokens from database', function(done) {
        let rt = '123';
        let event = testHelper.lambdaEvent({refresh_token: rt});
        this.deleteSession(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                assert(this.dbMock.deleteTokens.calledOnce, 'db.deleteTokens must be called');
                assert(this.dbMock.deleteTokens.calledWith(rt));
                expect(err).is.null;
                expect(data.statusCode).to.equal(200);
                expect(body.message).to.equal('session ended');
            });
        });
    });

    it('should return an error if refresh_token is not in the request', function(done) {
        let event = testHelper.lambdaEvent();
        this.deleteSession(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(this.dbMock.deleteTokens.called).is.not.true;
                expect(err).is.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal('refresh_token is required');
            });
        });
    });
});