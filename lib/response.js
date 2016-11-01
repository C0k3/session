'use strict';

//TODO: evolve and refactor: set cors value as part of a configuration object + function rather than a parameter to a single function
module.exports = function(statusCode, body, cors) {
    //NOTE: should I log non-200 statuses here as log.error()? seemes convient but also violates single responsibility principle
    
    //TODO: test other JS types
    body = typeof body === 'object' ? JSON.stringify(body) : body;

    //TODO: let cors parameter be a boolean value or object with header definitions
    let headers = cors ? { 'Access-Control-Allow-Origin': '*' } : {};
    return {
        statusCode : statusCode,
        headers: headers,
        body: body        
    };
};