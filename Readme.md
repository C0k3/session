[![Build Status](https://travis-ci.org/C0k3/session.svg?branch=development)](https://travis-ci.org/C0k3/session)
#/session: a Serverless API Example

This is an example API built with the Serverless Framework and Go.cd pipeline support. This Session API example creates user accounts and short and long-lived sessions using JSON Web Tokens. Details can be found in the [API Reference](api-reference.md).

##Core Technologies

* Node.js
* AWS Lambda, API Gateway, and DynamoDB
* The Serverless Framework v1.0
* The Go.cd build pipeline
* Unit testing and static analysis with Gulp, Mocha, Sinon, Proxyquire, and JSHint
* Code coverage with Istanbul

###The Serverless Framework v1.0

[The Serverless Framework v1.0](https://serverless.com/) provides two tools that speed up serverless development and deployment:

1. The [serverless.yml](serverless.yml) file defines all API Gateway and AWS Lambda function bindings as well as DynamoDB resources required to store user and session data. More information about serverless.yml can be found in the [Serverless Framework Development Guide](https://serverless.com/framework/docs/providers/aws/guide/services/).
2. The [Serverless CLI](https://serverless.com/framework/docs/providers/aws/cli-reference/) provides utilities to deploy whole API stacks and individual endpoints into an AWS account. This tool is used by the Go.cd build server for Continuous Deployments.

###The Go.cd build pipeline

The [Go.cd server](https://www.go.cd/) executes a per-function pipeline for automated testing, code coverage, and deployments. We're using [Tomasz Sętkowski's Go-CD Yaml Plugin](https://github.com/tomzo/gocd-yaml-config-plugin) to define all pipelines via the [pipelines.gocd.yaml](pipelines.gocd.yaml) file. More information about our pipeline definitions can be found here: [Definining Lambda Pipelines](pipelines.md). An example installation script for setting up your own Go.cd server can be found in the [go-serverless](https://github.com/C0k3/go-serverless) repository.

###Unit testing, static analysis, and code coverage

[Gulp](http://gulpjs.com/) is our task-runner of choice; test and lint tasks are defined in [gulpfile.js](gulpfile.js). We've also defined a pre-commit [git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) that will execute these test and lint tasks on ```git commit``` using the [git-guppy](https://www.npmjs.com/package/git-guppy) and [guppy-pre-commit](https://www.npmjs.com/package/git-guppy-pre-commit-hook) packages. The pre-commit hook will be created on ```npm install```.

The following libraries and packages are used for executing tests:

* [Mocha](https://mochajs.org/)
* [Chai](http://chaijs.com/api/bdd/)
* [Sinon](http://sinonjs.org/docs/#sinonspy)
* [Proxyquire](https://www.npmjs.com/package/proxyquire)

Unit tests live in the same directory as the code that they are testing and follow a *.test.js convention. The [createSession.test.js](lambda_functions/createSession/createSession.test.js) file is a good example to reference.

[JSHint](http://jshint.com/docs/) is used for linting/static code analysis and [instanbul](https://www.npmjs.com/package/istanbul) provides code coverege, with help from the [nyc](https://www.npmjs.com/package/nyc) command-line tool (used by the build server to run code coverage during pipeline deployments).

##Application Architecture
![image](https://cloud.githubusercontent.com/assets/11197026/20681286/ee6d8fe2-b570-11e6-8602-8d680ec7d099.png)
* Application resources are defined in [serverless.yml](serverless.yml).
* Build pipelines are defined in [pipelines.gocd.yaml](pipelines.gocd.yaml).
* VPC and NAT Gateway resources are defined in [aws-vpc.template](aws-vpc.template).
  * A "create-vpc" pipeline on the build server will execute this template on-demand

##The Microservices Pattern

Microservice architectures adhere to the following principles:

####Resource isolation
AWS Lambda supports resource isolation by hosting each Lambda function in its own set of containers with its own resource allocation (CPU and Memory). A Lambda function's resource allocation is defined using the "memorySize" field for that function in serverless.yml (see [docs](https://serverless.com/framework/docs/providers/aws/guide/functions/) for details).

####Development and deployment segregation
Deployments occur on a per-function basis: a function supporting a particular API endpoint can be deployed independantly of functions supporting other API endpoints.

The Continuous Integration/Continuous Delivery pipeline found in this example is designed to support the microservices pattern. Each Lambda function is indenpendantly tested and deployed (while any shared code is tested across all Lambda functions). 

Each Lambda function passes through 8 stages:

1. unit testing
2. linting
3. code coverage
4. automated deployment to the development environment
5. staging for test environment deployment
6. manual deployment to test environment
7. staging for prod environment deployment
8. manual deployment to prod environment

Steps 4, 6, and 8 deploy the Lambda function as well the API Gateway interface for the function.

All Lambda function pipelines are grouped together in Go.cd, with the build status of each stage visible (green):

![image](https://cloud.githubusercontent.com/assets/11197026/20761642/7d660108-b6d8-11e6-8dea-eba48bd5a674.png)
