'use strict';
var proxyquire = require('proxyquire'),
    chai = require('chai'),
    sinon = require('sinon'),
    assert = chai.assert,
    expect = chai.expect,
    testHelper = require('../../util/testHelper'),
    secrets = require('../../lib/secrets'),
    constants = require('../../lib/constants');

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