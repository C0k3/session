[![Build Status](https://travis-ci.org/C0k3/session.svg?branch=development)](https://travis-ci.org/C0k3/session)
#/session: a Serverless API Example

This is an example API built with the Serverless Framework and Go.cd pipeline support. This Session API example creates user accounts and short and long-lived sessions using JSON Web Tokens.

##Core Technologies

* Node.js
* AWS Lambda, API Gateway, and DynamoDB
* The Serverless Framework
* The Go.cd build server
* Unit testing and static analysis with Gulp, Mocha, Sinon, Proxyquire, and JSHint
* Code coverage with Istanbul

###The Serverless Framework v1.0

[The Serverless Framework v1.0](https://serverless.com/) provides two tools that speed up serverless development and deployment:

1. The [serverless.yml](serverless.yml) file defines all API Gateway and AWS Lambda function bindings as well as DynamoDB resources required to store user and session data.
2. The [Serverless CLI](https://serverless.com/framework/docs/providers/aws/cli-reference/) provides utilities to deploy whole API stacks and individual endpoints into an AWS account. This tool is used by the Go.cd build server for Continuous Deployments.

###The Go.cd build server

The [Go.cd server](https://www.go.cd/) defines a per-function pipeline for automated testing, code coverage, and deployments. We're using [Tomasz Sętkowski's Go-CD Yaml Plugin](https://github.com/tomzo/gocd-yaml-config-plugin) to define all pipelines via the [pipelines.gocd.yaml](pipelines.gocd.yaml) file. More information about our pipeline definition can be found here: [Definining Lambda Pipelines](pipelines.md). An installation script for setting up your own Go.cd server can be found in the [go-serverless](https://github.com/C0k3/go-serverless) repository.

###Unit testing, static analysis, and code coverage

[Gulp](http://gulpjs.com/) is our task-runner of choice; test and lint tasks are defined in [gulpfile.js](gulpfile.js). We've also defined a pre-commit [git hook](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) that will execute these test and lint tasks on ```git commit``` using the [git-guppy](https://www.npmjs.com/package/git-guppy) and [guppy-pre-commit](https://www.npmjs.com/package/git-guppy-pre-commit-hook) packages. The pre-commit hook will be created on ```npm intsall```.

The following libraries and packages are used for executing tests:

* [Mocha](https://mochajs.org/)
* [Chai](http://chaijs.com/api/bdd/)
* [Sinon](http://sinonjs.org/docs/#sinonspy)
* [Proxyquire](https://www.npmjs.com/package/proxyquire)

Unit tests live in the same directory as the code that they are testing and follow a *.test.js convention. The [createSession.test.js](lambda_functions/createSession/createSession.test.js) file is a good example to reference.

[JSHint](http://jshint.com/docs/) is used for linting/static code analysis and [insanbul](https://www.npmjs.com/package/istanbul) provides code coverege, with help from the [nyc](https://www.npmjs.com/package/nyc) command-line tool (used by the build server to run code coverage during pipeline deployments).

