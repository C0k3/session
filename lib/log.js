'use strict';
var config = require(`../config/${process.env.STAGE}.json`);
var log = require('bunyan').createLogger({name: 'koms', level: config.LogLevel || 'info' });

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
