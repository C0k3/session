/*jshint expr: true*/
'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../../util/testHelper'),
    secrets = require('../../lib/secrets');

//var createUser = require('./createUser');

const testPassword = 'Iam@llright2';
const testEmail = 'myman@me.com';

describe('createUser', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.hashSpy = this.sinon.spy(secrets.passwordDigest);
        this.dbMock = {};

        this.createUser = function(user) {
            this.dbMock = {
                getUser: this.sinon.spy(() => Promise.resolve(user ? user : {})),
                saveUser: this.sinon.spy()
            };
            return proxyquire('./createUser', {
                '../../lib/log': testHelper.mockLog,
                '../../lib/secrets': {
                    passwordDigest: this.hashSpy
                },
                '../../lib/db': this.dbMock
            });
        }.bind(this);
    });

    afterEach(function() {
        this.sinon.restore();
    });

    it('should throw an error on empty request body', function(done) {
        this.createUser()({}, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.message).to.equal('server error');
            });
        });
    });

    it('should validate that email field is present in request', function(done) {
        let event = testHelper.lambdaEvent({ password: '123' });        

        this.createUser()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidEmailOrPassword');
                expect(body.message).to.equal('The email or password was not provided');
            });
        });
    });

    it('should validate that email field is not empty in request', function(done) {
        let event = testHelper.lambdaEvent({ email: '', password: '123' });        

        this.createUser()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidEmailOrPassword');
                expect(body.message).to.equal('The email or password was not provided');
            });
        });
    });

    it('should validate that password field is present in request', function(done) {
        let event = testHelper.lambdaEvent({ email: testEmail });        

        this.createUser()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidEmailOrPassword');
                expect(body.message).to.equal('The email or password was not provided');
            });
        });
    });

    it('should validate that password field is not empty in request', function(done) {
        let event = testHelper.lambdaEvent({ email: testEmail, password: '' });    

        this.createUser()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidEmailOrPassword');
                expect(body.message).to.equal('The email or password was not provided');
            });
        });
    });

    it('should enforce strong password validation', function(done) {
        let event = testHelper.lambdaEvent({ email: testEmail, password: 'notgood' });

        this.createUser()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidEmailOrPassword');
                expect(body.message).to.equal('Weak password strength');
            });
        });
    });

    it('should validate email format', function(done) {
        let event = testHelper.lambdaEvent({ email: 'myman', password: testPassword });

        this.createUser()(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(500);
                expect(body.name).to.equal('InvalidEmailOrPassword');
                expect(body.message).to.equal('Invalid email format');
            });
        });
    });

    it('should check if user already exists before saving new user', function(done) {
        let event = testHelper.lambdaEvent({ email: testEmail, password: testPassword });

        this.createUser({Id: '1'})(event, {}, (err, data) => {
            let body = JSON.parse(data.body);
            testHelper.check(done, () => {
                expect(this.dbMock.getUser.calledOnce).is.true;
                expect(err).to.be.null;
                expect(data.statusCode).to.equal(200);
                expect(body.message).to.equal('user already exists');
            });
        });

    });

    it('should save new user', function(done) {
        let event = testHelper.lambdaEvent({ email: testEmail, password: testPassword });
        //TODO: look into this, if I pass in a user, this test still passes (it shouldn't)
        this.createUser()(event, {}, (err, data) => {
            testHelper.check(done, () => {
                expect(this.dbMock.saveUser.calledOnce).is.true;
            });
        });
    });

});