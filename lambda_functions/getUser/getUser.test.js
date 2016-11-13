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
        this.sinon = sinon.sandbox.create();

        this.dbMock = {
            getUser: this.sinon.spy(() => Promise.resolve({Id: '1'})),
            saveTokens: this.sinon.spy(() => Promise.resolve())
        };

        this.getUser = {
                '../../lib/log': testHelper.mockLog,
                '../../lib/db': this.dbMock
            };
    });

    afterEach(function() {
        this.sinon.restore();
    });
});