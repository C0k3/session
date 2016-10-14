'use strict';
var log = require('bunyan').createLogger({name: 'koms'});

module.exports = {
    error: (err) => {
        log.error(err);
        return err;
    },
    warn: (data) => {
        log.warn(data);
        return data;
    },
    info: (data) => {
        log.info(data);
        return data;
    },
    debug: (data) => {
        log.debug(data);
        return data;
    }
};
