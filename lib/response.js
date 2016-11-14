'use strict';

//TODO: evolve and refactor: set cors value as part of a configuration object + function rather than a parameter to a single function
module.exports = {
    create: function(statusCode, body, cors) {
        //NOTE: should I log non-200 statuses here as log.error()? seemes convient but also violates single responsibility principle
        
        //TODO: test other JS types
        body = typeof body === 'object' ? JSON.stringify(body) : body;

        cors = typeof cors !== 'undefined' ? cors : true; //cors default value is true
        let headers = cors ? { 'Access-Control-Allow-Origin': '*' } : {};
        return {
            statusCode : statusCode,
            headers: headers,
            body: body        
        };
    },
    genericError: function() {
        return this.create(500, {
            name: 'server_error',
            message: 'server error'
        });
    }
};