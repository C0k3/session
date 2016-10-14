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

function setEnvVars(requestContext) {
    process.env.NODE_ENV = requestContext.stage;
    //set any additional env vars here
}
