'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect;

describe('session check', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        
    });

    afterEach(function() {
        this.sinon.restore();
        
    });

    it('should return principleId and expiration date for any access token', function() {

    });
});