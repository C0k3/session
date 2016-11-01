'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../../util/testHelper'),
    secrets = require('../../lib/secrets');

//var createUser = require('./createUser');

describe('createUser', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.hashSpy = this.sinon.spy(secrets.passwordDigest);

        this.testProxy = proxyquire('./createUser', {
            '../../lib/log': testHelper.mockLog,
            '../../lib/secrets': {
                passwordDigest: this.hashSpy
            }
        });
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should throw an error on empty request body', function(done) {
        this.testProxy({}, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal('server error');
            });
        });
    });

    it('should validate that username field is present in request', function(done) {
        let event = testHelper.lambdaEvent({ password: '123' });        

        this.testProxy(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidUsernameOrPassword');
                expect(body.message).to.equal('The username or password was not provided');
            });
        });
    });

    it('should validate that username field is not empty in request', function(done) {
        let event = testHelper.lambdaEvent({ username: '', password: '123' });        

        this.testProxy(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidUsernameOrPassword');
                expect(body.message).to.equal('The username or password was not provided');
            });
        });
    });

    it('should validate that password field is present in request', function(done) {
        let event = testHelper.lambdaEvent({ username: 'myman' });        

        this.testProxy(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidUsernameOrPassword');
                expect(body.message).to.equal('The username or password was not provided');
            });
        });
    });

    it('should validate that password field is not empty in request', function(done) {
        let event = testHelper.lambdaEvent({ username: 'myman', password: '' });    

        this.testProxy(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidUsernameOrPassword');
                expect(body.message).to.equal('The username or password was not provided');
            });
        });
    });

    it('should enforce strong password validation', function(done) {
        let event = testHelper.lambdaEvent({ username: 'myman', password: 'notgood' });

        this.testProxy(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidUsernameOrPassword');
                expect(body.message).to.equal('Weak password strength');
            });
        });
    });

    it('should hash password', function(done) {
        let pw = 'Iam@llright2';
        let event = testHelper.lambdaEvent({ username: 'myman', password: pw });

        this.testProxy(event, {}, (err, data) => {
            testHelper.check(done, () => {
                assert(this.hashSpy.calledWith(pw));
                expect(this.hashSpy.returnValues.length).to.equal(1);
                expect(this.hashSpy.returnValues[0]).to.equal('1d807cf1c2eff9e84090db1d05020a236b1d6b96252d7894915d72d8b9478331');
            });
        });
    });

});