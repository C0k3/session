'use strict';
var constants = require('../lib/constants');

module.exports = {
    check: (done, test) => {
        try {
            test();
            done();
        } catch(e) {
            done(e);
        }
    },
    lambdaEvent: function (body) {
        let event = {};
        event.headers = {};
        event.headers[constants.CLIENT_ID_HEADER] = '12345';
        event.body = body ? JSON.stringify(body) : '{}';
        return event;
    },
    mockLog: {
        error: () => { return; },
        warn: () => { return; },
        info: () => { return; },
        debug: () => { return; }
    }
};
