'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../../util/testHelper');

//var createUser = require('./createUser');

describe('createUser', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();

        this.testProxy = proxyquire('./createUser', {
            '../../lib/log': testHelper.mockLog
        });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should throw an error on empty request body', function(done) {
        this.testProxy({}, {}, (err, data) => {
            testHelper.check(done, () => {
                expect(err).to.not.be.undefined;
                expect(err).to.equal('server error');
            });
        });
    });

});