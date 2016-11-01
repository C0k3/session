'use strict';
var proxyquire = require('proxyquire');

module.exports = {
    check: (done, test) => {
        try {
            test();
            done();
        } catch(e) {
            done(e);
        }
    },
    lambdaEvent: {
        headers: { 'X-koms-clientid': '12345' }
    },
    mockLog: {
        error: () => { return; },
        warn: () => { return; },
        info: () => { return; },
        debug: () => { return; }
    }
};
