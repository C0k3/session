'use strict';

// Your first function handler
module.exports.hello = (event, context, cb) => {
    const body = {
    message: 'Go Serverless v1.0! Your function executed successfully!',
    input: event,
  };

  const response = {
    statusCode: 200,
    headers: {
      'custom-header': 'Custom header value',
    },
    body: JSON.stringify(body),
  };

  cb(null, response);
};

// You can add more handlers here, and reference them in serverless.yml
