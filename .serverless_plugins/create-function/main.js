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
      FunctionName: this.function.name,
    };
    
    this.aws.request( 'Lambda', 'getFunction', params, this.options.stage, this.serverless.service.provider.region )
    .then( (result) => {
      return Promise.resolve();
    })
    .catch( (err) => {
      console.log( 'Err : ', err );
      params = {
        Code: {
          ZipFile: this.function.handler + ' = function() {}'
        },
        FunctionName: this.function.name,
        Handler: this.function.handler,
        Role: this.serverless.service.custom.IamRoleArnForCreate,
        Runtime: this.runtime
      };
      console.log( 'Params : ', params );
      return this.aws.request('Lambda', 'createFunction', params, this.options.stage, this.serverless.service.provider.region)
      .then( (output) => {
       console.log( 'Output : ', output );
      })
      .catch( (err) => {
        console.log( 'Err 2 : ', err );
      });
    });
  }
}

module.exports = ProviderDeployFunction;