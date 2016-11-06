'use strict';

class ProviderDeployFunction {
  constructor(serverless, options) {
    // console.log( 'Here', serverless );
    this.serverless = serverless;
    this.options = options;
    this.aws = this.serverless.getProvider('aws');
    this.function = serverless.service.functions[ this.options.f ];
    // console.log( this.options, this.function );
    this.runtime = this.serverless.service.provider.runtime;

    // set the providers name here
    this.provider = 'aws';

    this.commands = {
      deploy: {
        commands: {
          function: {
            lifecycleEvents: [
              'deploy'
            ]
          },
        }        
      },
    };
    this.hooks = {
      'before:deploy:function:deploy': this.beforeDeployFunction.bind(this)
    };

  }

  beforeDeployFunction() {
    
    let params = {
      FunctionName: this.options.function,
    };

    this.provider.request( 'Lambda', 'getFunction', params, this.options.stage, this.serverless.service.provider.region )
    .catch( () => {
      params = {
        Code: {
          ZipFile: this.function.handler + ' = function() {}'
        },
        FunctionName: this.options.function,
        Handler: this.function.handler,
        Role: this.serverless.service.custom.IamRoleArnForCreate,
        Runtime: this.runtime
      };
      return this.aws.request('Lambda', 'createFunction', params, this.options.stage, this.serverless.service.provider.region)
      .then( (output) => console.log );
    });
  }
}

module.exports = ProviderDeployFunction;