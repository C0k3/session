'use strict';

module.exports.ping = (event, context, cb) => {
    setEnvVars(event.requestContext);
    let response = {
        statusCode: 200,
        body: `all good in ${process.env.NODE_ENV}`
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
    setEnvVars(event.requestContext);
    require('./lambda_functions/getSession/getSession')(event, context, cb);
};

module.exports.createSession = (event, context, cb) => {
    setEnvVars(event.requestContext);
    require('./lambda_functions/createSession/createSession')(event, context, cb);
};

module.exports.refreshSession = (event, context, cb) => {
    setEnvVars(event.requestContext);
    require('./lambda_functions/refreshSession/refreshSession')(event, context, cb);
};

module.exports.createUser = (event, context, cb) => {
    setEnvVars(event.requestContext);
    require('./lambda_functions/createUser/createUser')(event, context, cb);
};

module.exports.getUser = (event, context, cb) => {
    setEnvVars(event.requestContext);
    require('./lambda_functions/getUser/getUser')(event, context, cb);
};

function setEnvVars(requestContext) {
    process.env.NODE_ENV = requestContext.stage;
    //set any additional env vars here
}
