/*jshint expr: true*/
'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../util/testHelper'),
    secrets = require('./secrets');

describe('db', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.hashSpy = this.sinon.spy(secrets.passwordDigest);
        this.putSpy = this.sinon.spy((params, cb) => {
            cb(null, 'mock');
        });

        this.getProfileData = () => {
            return {
                account_type: 'traditional',
                username: 'test@test.com',
                password: 'Iam@llright2'
            };
        };

        function mockDoc() {}
        mockDoc.prototype.put = this.putSpy;

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

    describe('saveUser', function() {
        it('should hash password', function(done) {
            let profileData = this.getProfileData();
            this.db.saveUser(profileData, 'clientid')
                .then(data => {
                    testHelper.check(done, () => {
                        assert(this.hashSpy.calledWith(profileData.password));
                        expect(this.hashSpy.returnValues.length).to.equal(1);
                        expect(this.hashSpy.returnValues[0]).to.equal('1d807cf1c2eff9e84090db1d05020a236b1d6b96252d7894915d72d8b9478331');
                    });
                });
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
            });
        });
    });
});
