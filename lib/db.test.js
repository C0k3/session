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

        function mockDoc() {}
        mockDoc.prototype.put = function(params, cb) {
            cb(null, 'mock');
        };

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
        
        let profileData = {
            accountType: 'traditional',
            userName: 'test@test.com',
            password: 'Iam@llright2'
        };

        this.db.saveUser(profileData, 'clientid')
            .then(data => {
                testHelper.check(done, () => {
                    assert(this.hashSpy.calledWith(profileData.password));
                    expect(this.hashSpy.returnValues.length).to.equal(1);
                    expect(this.hashSpy.returnValues[0]).to.equal('1d807cf1c2eff9e84090db1d05020a236b1d6b96252d7894915d72d8b9478331');
                });
            });
        });

    /*
        it('should check if user already exists before storing new user item', function(done) {

        });

        it('should store new user to DynamoDB', function(done) {

        });
    */
    });
});