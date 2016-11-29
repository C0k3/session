/*jshint expr: true*/
'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    secrets = require('./secrets');

describe('secrets', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();

        let deps = {};
        deps[`../config/${process.env.STAGE}`] = {
            ApiIdSalt: '123',
            PasswordSalt: '456'
        };

        this.secrets = proxyquire('./secrets', deps);
    });

    afterEach(function() {
        this.sinon.restore();
    });

    describe('#apiIdDigest()', function() {
        it('should create sha256 hash using apiId salt', function() {
            let digest = this.secrets.apiIdDigest('abc');
            expect(digest).to.equal('6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090');
        });
    });

    describe('#passwordDigest()', function() {
        it('should create sha256 hash using password salt', function() {
            let digest = this.secrets.passwordDigest('abc');
            expect(digest).to.equal('57ce52cfd20c484c8b41569b8c43274f86c45f77d05e83c300854dbdef7c9d7a');
        });
    });
});