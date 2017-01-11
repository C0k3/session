/*jshint expr: true*/
'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
const constants = require('./constants');
const authorization = require('./authorization');
const AuthPolicy = require('./AuthPolicy');

describe('authorization', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
    });

    afterEach(function() {
        this.sinon.restore();
    });

    describe('#checkClientId()', function() {
        it('should throw an error if clientId parameter is empty or undefined', function() {
            let emptyCall = () => authorization.checkClientId();
            let undefinedCall = () => authorization.checkClientId(undefined);

            expect(emptyCall).to.throw(Error, `${constants.CLIENT_ID_HEADER} key missing in request header`);
            expect(undefinedCall).to.throw(Error, `${constants.CLIENT_ID_HEADER} key missing in request header`);           
        });

        it('should return clientId', function() {
            let clientId = authorization.checkClientId('123');
            expect(clientId).to.equal('123');
        });
    });

    describe('#createAuthPolicy()', function() {
        let event = {
            methodArn: 'arn:aws:execute-api:us-east-1:{accountId}:{apiId}/patrick/GET/session'
        };
        let principleId = '123';

        it('should return an AuthPolicy object', function() {
            let policy = authorization.createAuthPolicy(event, principleId);
            expect(policy).to.be.an.instanceof(AuthPolicy);
        });
    });
});
