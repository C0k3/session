/*jshint expr: true*/
'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
const response = require('./response');

describe('response', function() {
    beforeEach(function() {
        this.sinon = sinon.sandbox.create();
        this.defaulCorsHeader = { 'Access-Control-Allow-Origin': '*' };
    });

    afterEach(function() {
        this.sinon.restore();
    });

    describe('#create()', function() {
        it('should return statusCode, headers, and body', function() {
            let res = response.create(200, {}, true);
            expect(res).to.have.property('statusCode', 200);
            expect(res).to.have.property('headers').that.deep.equals(this.defaulCorsHeader);
            expect(res).to.have.property('body', '{}');
        });

        it('should stringify the response body', function() {
            let res = response.create(200, { test: '123' }, true);            
            expect(res.body).to.equal('{"test":"123"}');
        });

        it('should return default cors header if no cors parameter is provided', function() {
            let res = response.create(200, {});
            expect(res.headers).to.deep.equal(this.defaulCorsHeader);
        });

        it('should return default cors header if cors parameter equals true', function() {
            let res = response.create(200, {}, true);
            expect(res.headers).to.deep.equal(this.defaulCorsHeader);
        });

        it('should return empty cors header if cors parameter is false', function() {
            let res = response.create(200, {}, false);
            expect(res.headers).to.deep.equal({});
        });

        it('should return object in cors header if cors parameter is an object', function() {
            let customCors = { 'Access-Control-Allow-Origin': 'some.domain' };
            let res = response.create(200, {}, customCors);
            expect(res.headers).to.deep.equal(customCors);
        });
    });

    describe('#genericError()', function() {
        it('should return 500 status and generic server error message', function() {
            let res = response.genericError();
            let body = JSON.parse(res.body);

            expect(res.body).to.be.a('string');
            expect(res.statusCode).to.equal(500);
            expect(res.headers).to.deep.equal(this.defaulCorsHeader);

            expect(body.name).to.equal('server_error');
            expect(body.message).to.equal('server error');
        });
    });
});