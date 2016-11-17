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
    token = require('../../lib/token');

describe('refreshSession', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.userId = '1';
        this.clientId = '2';
        this.createEvent = (freshAccessToken, freshRefreshToken) => {            
            let apiId = testHelper.lambdaEvent().requestContext.apiId;
            let getExpiration = isFresh => { return isFresh ? 10000 : -10000; };
                        
            let expiration = getExpiration(freshRefreshToken);
            let rToken = token.createRefreshToken(this.userId, this.clientId, apiId, expiration);

            expiration = getExpiration(freshAccessToken);            
            let aToken = token.createAccessToken(this.userId, this.clientId, apiId, expiration);

            let event = testHelper.lambdaEvent({ refresh_token: rToken });
            event.headers[constants.AUTHORIZATION_HEADER] = `Bearer ${aToken}`;

            return event;
        };

        this.createDbMock = (event) => {
            let access_token = event.headers[constants.AUTHORIZATION_HEADER].split(' ')[1];
            let eventBody = JSON.parse(event.body);  
            let refresh_token = eventBody.refresh_token;
            let dbMock = {
                getTokens: () => Promise.resolve({
                    AccessToken: access_token,
                    IssuedAt: jwt.decode(refresh_token).iat,
                    SessionCreatedAt: jwt.decode(refresh_token).iat,
                    ExpiresAt: jwt.decode(refresh_token).exp,
                    ClientId: this.clientId,
                    RefreshToken: refresh_token,
                    PrincipalId: this.userId
                }),
                saveTokens: () => Promise.resolve()
            };

            return dbMock;
        }

        this.refreshToken = (dbMock) => { 
            return proxyquire('./refreshSession', {
                '../../lib/log': testHelper.mockLog,
                '../../lib/db': !!dbMock ? dbMock : {}
            });
        };
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should return current access_token and refresh_token if access_token is not expired', function(done) {
        let event = this.createEvent(true, true);
        let eventBody = JSON.parse(event.body);
        let access_token = event.headers[constants.AUTHORIZATION_HEADER].split(' ')[1];
        this.refreshToken(this.createDbMock(event))(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(200);
                expect(body.refresh_token).to.equal(eventBody.refresh_token);
                expect(body.access_token).to.equal(access_token);
                expect(body.access_token_expires_in).to.be.a('Number');
            });
        });
    });

    it('should create new access_token if current access_token is expired', function(done) {        
        let event = this.createEvent(false, true);
        let eventBody = JSON.parse(event.body);
        let access_token = event.headers[constants.AUTHORIZATION_HEADER].split(' ')[1];

        this.refreshToken(this.createDbMock(event))(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(200);
                expect(body.refresh_token).to.equal(eventBody.refresh_token);
                expect(body.access_token).to.not.equal(access_token);
                expect(body.access_token_expires_in).to.be.a('Number');
            });
        });
    });

    it('should only refresh current token', function(done) {
        let event = this.createEvent(false, true);
        let eventBody = JSON.parse(event.body);        
        let refresh_token = eventBody.refresh_token;
        let dbMock = {
            getTokens: () => Promise.resolve({
                AccessToken: 'the current token',
                IssuedAt: jwt.decode(refresh_token).iat,
                SessionCreatedAt: jwt.decode(refresh_token).iat,
                ExpiresAt: jwt.decode(refresh_token).exp,
                ClientId: this.clientId,
                RefreshToken: refresh_token,
                PrincipalId: this.userId
            }),
            saveTokens: () => Promise.resolve()
        };

        this.refreshToken(dbMock)(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(401);
                expect(body.message).to.equal('can only refresh most recently expired access token');
            });
        });
    });

    it('should return error if refresh_token is not in the request', function(done) {
        this.refreshToken()(testHelper.lambdaEvent(), {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal('refresh_token field is not in the request');
            });
        });
    });

    it('should return 401 if refresh_token is not in the database', function(done) {
        let event = this.createEvent(false, true);       
        let dbMock = {
            getTokens: () => Promise.resolve(undefined),
            saveTokens: () => Promise.resolve()
        };

        this.refreshToken(dbMock)(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(401);
                expect(body.message).to.equal('session no longer exists');
            });
        });
    });

    it('should return 401 for expired refresh_token', function(done) {
        let event = this.createEvent(false, false);
        this.refreshToken(this.createDbMock(event))(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(401);
                expect(body.message).to.equal('refresh_token is expired');
            });
        });
    });

    it('should return error if clientId request header is not present', function(done) {
        let event = this.createEvent(false, false);
        event.headers = {};
        this.refreshToken()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal(`${constants.CLIENT_ID_HEADER} key missing in request header`);
            });
        });
    });
});
