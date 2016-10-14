'use strict';

// Your first function handler
module.exports.ping = (event, context, cb) => {
    setEnvVars(event.requestContext);
    let response = {
        statusCode: 200,
        body: `all good in ${process.env.NODE_ENV}`
    };

    context.succeed(response);
};

module.exports.authorizer = (event, context, cb) => {
    //NOTE: if the function bound to this authorizer is a "lambda" inegration, will the requestContext object be available?
    setEnvVars(event.requestContext);
    require('./lambda_functions/authorizer/authorizer')(event, context, cb);
};

function setEnvVars(requestContext) {
    process.env.NODE_ENV = requestContext.stage;
    //set any additional env vars here
}
