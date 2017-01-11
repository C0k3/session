'use strict';

const constants = require('../lib/constants');

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
        event.requestContext = { apiId: '12345zzzzz' }
        return event;
    },
    mockLog: {
        error: () => { return; },
        warn: () => { return; },
        info: () => { return; },
        debug: () => { return; }
    }
};
