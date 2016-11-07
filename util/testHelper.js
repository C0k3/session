'use strict';

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
        event.headers = { 'X-koms-clientid': '12345' };

        if (body) {
            event.body = JSON.stringify(body);
        }

        return event;
    },
    mockLog: {
        error: () => { return; },
        warn: () => { return; },
        info: () => { return; },
        debug: () => { return; }
    }
};
