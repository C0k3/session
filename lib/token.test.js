/*jshint expr: true*/
'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../util/testHelper'),
    config = require(`../config/${process.env.STAGE}`),
    jwt = require('jsonwebtoken');

describe('token', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.secret = 'secret';
        this.token = proxyquire('./token', {
            './secrets': {
                apiIdDigest: () => this.secret
            }
        });

        this.userId = '123';
        this.clientId = '456';
    });

    afterEach(function() {
        this.sinon.restore();
    });

    describe('#parseAuthorizationHeader()', function() {
        it('should reject if authHeader parameter is undefined', function(done) {
            this.token.parseAuthorizationHeader()
                .then(() => done('did not reject'))
                .catch(err => {
                    testHelper.check(done, () => {
                        expect(err).to.deep.equal({ name: 'no_header', message: 'no authorization header found' });
                    });
                });
        });

        it('should reject if authHeader parameter has improper scheme', function(done) {
            this.token.parseAuthorizationHeader('notBearer 1234')
                .then(() => done('did not reject'))
                .catch(err => {
                    testHelper.check(done, () => {
                        expect(err).to.deep.equal({ name: 'credentials_bad_scheme', message: 'Format is Authorization: Bearer [token]' });
                    });
                });
        });

        it('should reject if authHeader param is improperly formatted', function(done) {
            this.token.parseAuthorizationHeader('whatevs')
                .then(() => done('did not reject'))
                .catch(err => {
                    testHelper.check(done, () => {
                        expect(err).to.deep.equal({ name: 'credentials_bad_format', message: 'Format is Authorization: Bearer [token]' });
                    });
                });
        });
    });

    describe('#getTimeRemaining()', function() {
        it('should return time remaining for unexpired token', function(done) {
            let secret = 'secret';
            let expiration = 1000;
            let token = jwt.sign({}, secret, { expiresIn: expiration });

            this.token.getTimeRemaining(token, secret)
                .then(time_remaining => {
                    testHelper.check(done, () => {
                        //subtracting 5 seconds to account for any latency in test run
                        expect(time_remaining).to.be.within(expiration - 5, expiration);
                    });                    
                })
                .catch(err => done(err));
        });

        it('should return 0 for expired token', function(done) {
            let secret = 'secret';       
            let token = jwt.sign({}, secret, { expiresIn: -1000 });

            this.token.getTimeRemaining(token, secret)
                .then(time_remaining => {
                    testHelper.check(done, () => {
                        //subtracting 5 seconds to account for any latency in test run
                        expect(time_remaining).to.equal(0);
                    });                    
                })
                .catch(err => done(err));
        });
    });

    describe('#createRefreshToken()', function() {
        it('should create new token', function() {
            let token = this.token.createRefreshToken(this.userId, this.clientId, 'apiId', config.RefreshTokenExpiration);
            let decoded = jwt.verify(token, this.secret);
            expect(decoded.type).to.equal('refresh');
            expect(decoded.aud).to.equal(this.clientId);
            expect(decoded.sub).to.equal(this.userId);
            expect(decoded.iat).to.be.a('Number');
            expect(decoded.exp).to.be.a('Number');
        });
    });

    describe('#createAccessToken()', function() {
        it('should create new token', function() {
            let token = this.token.createAccessToken(this.userId, this.clientId, 'apiId', config.RefreshTokenExpiration);
            let decoded = jwt.verify(token, this.secret);
            expect(decoded.type).to.equal('access');
            expect(decoded.aud).to.equal(this.clientId);
            expect(decoded.sub).to.equal(this.userId);
            expect(decoded.iat).to.be.a('Number');
            expect(decoded.exp).to.be.a('Number');
        });
    });
});