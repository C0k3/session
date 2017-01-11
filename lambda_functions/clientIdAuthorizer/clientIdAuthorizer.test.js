'use strict';

const proxyquire = require('proxyquire');
const chai = require('chai');
const sinon = require('sinon');
const assert = chai.assert;
const expect = chai.expect;
const testHelper = require('../../util/testHelper');
const secrets = require('../../lib/secrets');
const constants = require('../../lib/constants');

describe('clientIdAuthorizer', function() {
    beforeEach(function() {
        this.clientIdAuthorizer = proxyquire('./clientIdAuthorizer', {
            '../../lib/log': testHelper.mockLog
        });
    });    

    it(`should fail when authorizationToken is not defined`, function(done) {
        let event = testHelper.lambdaEvent();

        this.clientIdAuthorizer(event, {}, (err, data) => {
            testHelper.check(done, () => {
                expect(err).to.equal('Fail');
                expect(data.name).to.equal('client_id_error');
                expect(data.message).to.equal(`${constants.CLIENT_ID_HEADER} key missing in request header`);
            });
        });
    });
});