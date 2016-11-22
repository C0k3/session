/*jshint expr: true*/
'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../util/testHelper'),
    secrets = require('./secrets'),
    token = require('./token'),
    config = require(`../config/${process.env.STAGE}`),
    jwt = require('jsonwebtoken');

describe('db', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.hashSpy = this.sinon.spy(secrets.passwordDigest);
        this.putSpy = this.sinon.spy((params, cb) => {
            cb(null, 'mock');
        });
        this.querySpy = this.sinon.spy((params, cb) => {
            cb(null, { Items: [{ 
                    Id: '1', 
                    Password: secrets.passwordDigest(this.getProfileData().password)
                }]
            });
        });
        this.getSpy = this.sinon.spy((params, cb) => {
            cb(null, { Item: {} });
        });
        this.deleteSpy = this.sinon.spy((params, cb) => {
            cb(null, 'mock');
        });

        this.getProfileData = () => {
            return {
                account_type: 'traditional',
                email: 'test@test.com',
                password: 'Iam@llright2'
            };
        };

        function mockDoc() {}
        mockDoc.prototype.put = this.putSpy;
        mockDoc.prototype.query = this.querySpy;
        mockDoc.prototype.get = this.getSpy;
        mockDoc.prototype.delete = this.deleteSpy;

        let awsmock = {
                DynamoDB: {
                    DocumentClient: mockDoc
                }            
            };

        this.db = proxyquire('./db', {
            './log': testHelper.mockLog,
            './secrets': {
                passwordDigest: this.hashSpy
            },
            'aws-sdk': awsmock
        });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    describe('#saveUser()', function() {
        it('should hash password', function(done) {
            let profileData = this.getProfileData();
            this.db.saveUser(profileData, 'clientid')
                .then(data => {
                    testHelper.check(done, () => {
                        assert(this.hashSpy.calledWith(profileData.password));
                        expect(this.hashSpy.returnValues.length).to.equal(1);
                        expect(this.hashSpy.returnValues[0]).to.equal('1d807cf1c2eff9e84090db1d05020a236b1d6b96252d7894915d72d8b9478331');
                    });
                }).catch(err => done(err));
        });
        
        it('should store new user to DynamoDB', function(done) {
            let profileData = this.getProfileData();
            let clientId = 'clientid';
            this.db.saveUser(profileData, clientId)
                .then(data => {
                    testHelper.check(done, () => {
                        expect(this.putSpy.calledOnce).to.be.true;
                        expect(this.putSpy.args[0].length).to.equal(2);

                        let params = this.putSpy.args[0][0];
                        expect(params.TableName).to.equal('test-KODemoUsers');
                        expect(params.Item.Id).to.not.be.empty;
                        expect(params.Item.DateCreated).to.not.be.empty;
                        expect(params.Item.DateModified).to.not.be.empty;
                        expect(params.Item.Type).to.equal(profileData.account_type);
                        expect(params.Item.UserName).to.equal(profileData.username);
                        expect(params.Item.ClientId).to.equal(clientId);
                    });
                }).catch(err => done(err));
        });
    });

    describe('#getUser()', function() {
        it('should query dynamoDB', function(done) {            
            this.db.getUser(this.getProfileData())
                .then(user => {
                    testHelper.check(done, () => {
                        expect(this.querySpy.calledOnce).to.be.true;
                        expect(this.querySpy.args[0].length).to.equal(2);
                    });
                }).catch(err => done(err));
        });

        it('should query by Id if id parameter is present', function(done) {
            let profileData = {
                id: '123|facebook',
                account_type: 'facebook'
            };
            this.db.getUser(profileData)
                .then(user => {
                    testHelper.check(done, () => {                    
                        let params = this.querySpy.args[0][0];
                        expect(params.TableName).to.equal('test-KODemoUsers');                    
                        expect(params.KeyConditionExpression).to.equal('Id = :hk_val');
                        expect(params.ExpressionAttributeValues).to.deep.equal({ ':hk_val': profileData.id });
                    });
                }).catch(err => done(err));
        });

        it('should query by Email if email and password parameters are present', function(done) {           
            this.db.getUser(this.getProfileData())
                .then(user => {
                    testHelper.check(done, () => {                    
                        let params = this.querySpy.args[0][0];
                        expect(params.TableName).to.equal('test-KODemoUsers');                    
                        expect(params.IndexName).to.equal('Email-index');
                        expect(params.KeyConditionExpression).to.equal('#hashkey = :hk_val');
                        expect(params.ExpressionAttributeNames).to.deep.equal({ '#hashkey': 'Email' });
                        expect(params.ExpressionAttributeValues).to.deep.equal({ ':hk_val': this.getProfileData().email});
                        
                    });
                }).catch(err => done(err));
        });

        it('should reject if incomplete profile data is provided', function(done) {
            let profileData = { account_type: 'traditional' };
            this.db.getUser(profileData)
                .then(user => {
                    done('did not reject');
                })
                .catch(err => {
                    testHelper.check(done, () => {
                        expect(err).to.equal('incomplete profile data: id or email + password required');
                    });
                });
        });        

        it('should verify password for traditional accounts', function(done) {
            let profileData = this.getProfileData();
            profileData.password = '123';
            this.db.getUser(profileData)
                .then(user => {
                    done('did not reject');
                }).catch(err => {
                    testHelper.check(done, () => {                    
                        expect(err).to.equal('password is incorrect');                         
                    });
                });
        });
    });

    describe('#saveTokens()', function() {
        it('should save token info', function(done) {
            let userId = '1';
            let clientId = '2';
            let apiId = '3';
            let rToken = token.createRefreshToken(userId, clientId, apiId, config.RefreshTokenExpiration);
            let aToken = token.createAccessToken(userId, clientId, apiId, config.AccessTokenExpiration);
            let decodedRToken = jwt.decode(rToken);
            this.db.saveTokens(rToken, aToken, userId, clientId)
                .then(() => {
                    testHelper.check(done, () => {
                        assert(this.putSpy.calledOnce, 'put must be called one time');
                        let params = this.putSpy.args[0][0];
                        expect(params.TableName).to.equal(config.RefreshTokenTable);
                        expect(params.Item.RefreshToken).to.equal(rToken);
                        expect(params.Item.PrincipalId).to.equal(userId);
                        expect(params.Item.AccessToken).to.equal(aToken);
                        expect(params.Item.ClientId).to.equal(clientId);
                        expect(params.Item.IssuedAt).to.equal(decodedRToken.iat);
                        expect(params.Item.ExpiresAt).to.equal(decodedRToken.exp);
                        expect(params.Item.SessionCreatedAt).to.equal(decodedRToken.iat);
                    });
                })
                .catch(err => done(err));
        });
    });

    describe('#getTokens()', function() {
        it('should get token info', function(done) {
            let rToken = token.createRefreshToken('1', '2', '3', config.RefreshTokenExpiration);
            this.db.getTokens(rToken)
                .then(() => {
                    testHelper.check(done, () => {
                        assert(this.getSpy.calledOnce, 'get must be called one time');
                        let params = this.getSpy.args[0][0];
                        expect(params.TableName).to.equal(config.RefreshTokenTable);
                        expect(params.Key).to.deep.equal({ RefreshToken: rToken });
                    });
                })
                .catch(err => done(err));
        });
    });

    describe('#deleteTokens()', function() {
        it('should delete token', function(done) {
            let rToken = token.createRefreshToken('1', '2', '3', config.RefreshTokenExpiration);
            this.db.deleteTokens(rToken)
                .then(() => {
                    testHelper.check(done, () => {
                        assert(this.deleteSpy.calledOnce, 'delete must be called one time');
                        let params = this.deleteSpy.args[0][0];
                        expect(params.TableName).to.equal(config.RefreshTokenTable);
                        expect(params.Key).to.deep.equal({ RefreshToken: rToken });
                    });
                })
                .catch(err => done(err));
        });
    });
});
