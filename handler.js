'use strict';

module.exports.ping = (event, context, cb) => {
    let response = {
        statusCode: 200,
        body: `all good in ${process.env.STAGE}`
    };

    context.succeed(response);
};

module.exports.authorizer = (event, context, cb) => {
    /*
        {
            "type": "TOKEN",
            "authorizationToken": "123",
            "methodArn": "arn:aws:execute-api:us-east-1:....5.....:uxyeaewr96/patrick/GET/user"
        }
    */
    require('./lambda_functions/authorizer/authorizer')(event, context, cb);
};

module.exports.clientIdAuthorizer = (event, context, cb) => {
    require('./lambda_functions/clientIdAuthorizer/clientIdAuthorizer')(event, context, cb);
};

module.exports.getSession = (event, context, cb) => {
    require('./lambda_functions/getSession/getSession')(event, context, cb);
};

module.exports.createSession = (event, context, cb) => {
    require('./lambda_functions/createSession/createSession')(event, context, cb);
};

module.exports.refreshSession = (event, context, cb) => {
    require('./lambda_functions/refreshSession/refreshSession')(event, context, cb);
};

module.exports.deleteSession = (event, context, cb) => {
    require('./lambda_functions/deleteSession/deleteSession')(event, context, cb);
};

module.exports.createUser = (event, context, cb) => {
    require('./lambda_functions/createUser/createUser')(event, context, cb);
};

module.exports.getUser = (event, context, cb) => {
    require('./lambda_functions/getUser/getUser')(event, context, cb);
};

