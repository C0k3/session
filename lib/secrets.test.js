/*jshint expr: true*/
'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
const secrets = require('./secrets');

describe('secrets', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();

        process.env.API_ID_SALT = '123';
        process.env.PASSWORD_SALT = '456';
    });

    afterEach(function() {
        this.sinon.restore();
    });

    describe('#apiIdDigest()', function() {
        it('should create sha256 hash using apiId salt', function() {
            let digest = secrets.apiIdDigest('abc');
            expect(digest).to.equal('6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090');
        });
    });

    describe('#passwordDigest()', function() {
        it('should create sha256 hash using password salt', function() {
            let digest = secrets.passwordDigest('abc');
            expect(digest).to.equal('57ce52cfd20c484c8b41569b8c43274f86c45f77d05e83c300854dbdef7c9d7a');
        });
    });
});