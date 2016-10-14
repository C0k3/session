'use strict';
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