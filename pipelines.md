1. Within this git repository, there is a file called [pipelines.gocd.yaml](pipelines.gocd.yaml). The full syntax capabilities of that file can be found in [Tomasz Sętkowski's awesome Go-CD Yaml Plugin Repo](https://github.com/tomzo/gocd-yaml-config-plugin)
1. The `pipelines.gocd.yaml` file is where all Lambda function CI/CD pipelines are defined. Each pipeline definition includes linting, unit testing, code coverage, dev deployments, test deployments, and production deployments.
1. Whenever you add a new Lambda function, it is not necessary to copy the entire pipeline defintion. Each pipeline definiton instance can use the first definition as a template using standard YAML Anchoring capabilities. For example, if you wanted to add a new Lambda function called `smilesAndFun` you would append the following contents at the same indentation of previous pipelines:
  
        smilesAndFun:
          group: lambda
          label_template: "${smilesAndFun[:8]}"
          environment_variables:
            FUNCTION_NAME: smilesAndFun
          materials:
            smilesAndFun:
              git: https://github.com/C0k3/session
              branch: development
              whitelist:
              - lambda_functions/smilesAndFun/**/*.*
              - "*.js"
              - "*.json"
              - "*.opts"
              - "*.yml"
              - "*.yaml"
          stages: *stages
1. The new pipeline will be added to the Go-CD server when the updated pipelines.gocd.yaml file is pushed to the repository.
