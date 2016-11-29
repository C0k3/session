'use strict';

module.exports = {
    create: function(statusCode, body, cors) {
        
        //TODO: test other JS types
        body = typeof body === 'object' ? JSON.stringify(body) : body;

        cors = typeof cors !== 'undefined' ? cors : true; //cors default value is true
        let headers = {};

        if (typeof cors === 'object') {
            headers = cors;
        } else if (cors) {
            headers = { 'Access-Control-Allow-Origin': '*' };
        }

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