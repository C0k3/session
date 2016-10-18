'use strict';

//TODO: evolve and refactor: set cors value as part of a configuration object + function rather than a parameter to a single function
module.exports = function(statusCode, body, cors) {
    //TODO: test other JS types
    body = typeof body === 'object' ? JSON.stringify(body) : body;
    let headers = cors ? { 'Access-Control-Allow-Origin': '*' } : {};
    return {
        statusCode : statusCode,
        headers: headers,
        body: body        
    };
};