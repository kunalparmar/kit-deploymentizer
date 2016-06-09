<p align="center">
  <img src="https://github.com/InVisionApp/kit-deploymentizer/raw/master/media/kit-logo-horz-sm.png">
</p>

# kit-deploymentizer
[![Codeship](https://codeship.com/projects/1106f660-adcb-0133-cbe3-167728a5fef7/status?branch=master)](https://codeship.com/projects/132140)
[![Dependency Status](https://david-dm.org/InVisionApp/kit-deploymentizer.svg)](https://david-dm.org/InVisionApp/kit-deploymentizer)
[![devDependency Status](https://david-dm.org/InVisionApp/kit-deploymentizer/dev-status.svg)](https://david-dm.org/InVisionApp/kit-deploymentizer#info=devDependencies)

This service intelligently builds deployment files as to allow reusability of environment variables and other forms of configuration. It also supports aggregating these deployments for multiple clusters. In the end, it generates a list of clusters and a list of deployment files for each of these clusters. Best used in collaboration with `kit-deployer` and `kit-image-deployer` to achieve a continuous deployment workflow.

## How it works

The `deploymentizer` will parse cluster yaml files and output the resulting Kubernetes files grouped by cluster. Cluster yaml files look like the following:

```yaml
# example-cluster.yaml
kind: Cluster
metadata:
  name: example-cluster
spec:
  - fromFile: app-svc.yaml
  - fromFile: app-deployment.yaml
```

The `metadata.name` property is used as the name of the folder to store all the files generated for this cluster in. Note the `fromFile` property. This is what allows you to reuse configuration files. The `fromFile` property will include the file it points to. More importantly you can use the `fromFile` property in your normal Kubernetes files allowing you to breakup your files into multiple files and reuse information however you like. Every item listed in the cluster `spec` array should amount to a full and valid Kubernetes file. For example, extending from the example above:

```yaml
# app-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: app-svc
spec:
  selector:
    fromFile: app-selector.yaml
```

```yaml
# app-deployment.yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 2
  selector:
    fromFile: app-selector.yaml
  template:
    metadata:
      labels:
        fromFile: app-selector.yaml
    spec:
      containers:
        - name: app-con
          image: node:5.5.0-slim
          fromFile: app-env.yaml
          env:
            - name: DEBUG
              value: "0"
```

```yaml
# app-env.yaml
env:
  - name: DEBUG
    value: "1"
  - name: DOMAIN
    value: "google.com"
```

In the above example, the `DEBUG` env setting will be set to `0` (overriding the default of `1` in the `app-env.yaml`) and the deployment file will inherit the `DOMAIN=google.com` env setting.

```yaml
# app-selector.yaml
name: app-pod
```

With this `app-selector.yaml` file, the service and deployment file that is generated will inherit this `name: app-pod` setting. So you can set your selector in one file and reuse everywhere it's needed.

You can use `fromFile` wherever you like and you can override settings wherever you need (including your `*-cluster.yaml` files).

The files that are generated will be named based on the `metadata.name` property so this is required.

You can see see what this example generates by running:

1. `docker run --rm -v $(pwd)/generated:/generated -v $(pwd)/example:/example kit-deploymentizer --pattern /example/*-cluster.yaml`

You should get a folder called `example-cluster` with two files in it:

```yaml
# app-deployment.yaml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 2
  selector:
    name: app-pod
  template:
    metadata:
      labels:
        name: app-pod
    spec:
      containers:
        - name: app-con
          image: 'node:5.5.0-slim'
          env:
            - name: DEBUG
              value: '0'
            - name: DOMAIN
              value: google.com
```

```yaml
# app-svc.yaml
apiVersion: v1
kind: Service
metadata:
  name: app-svc
spec:
  selector:
    name: app-pod
```

## Running

As long as you have access to our private docker registry, you can use the image as follows:

1. `docker run --rm quay.io/invision/kit-deploymentizer --help`

This will show you the help information for the deploymentizer command. If you would like to pass in some files to be parsed and have the generated output saved, you can use volumes. The syntax for this would be:

1. `docker run --rm -v <ABSOLUTE_PATH_FOR_GENERATED_FILES>:/generated -v <ABSOLUTE_PATH_TO_CLUSTER_FILES>:/raw kit-deploymentizer --pattern <GLOB_PATTERN_FOR_CLUSTER_FILES>`

The pattern you provide can be in the [glob](https://github.com/isaacs/node-glob) format. It should match ONLY files of `kind: Cluster`.

## Using as npm module

Use npm to install `kit-deploymentizer`:

```
$ npm install kit-deploymentizer --save
```

Then require it and use it like so:

```js
var Deploymentizer = require("kit-deploymentizer").Deploymentizer;

var deploymentizer = new Deploymentizer({
	save: true,
	output: "/output"
});

deploymentizer
	.generate("/manifests/**/*-cluster.yaml")
	.then(console.log)
	.catch(console.error)
	.done();
```

## Using as CLI

You can run the `./src/deploymentizer --help` to see how it works.

Note this method requires node and was tested on version `5.5.0`.

## Expected environment variables
The following environment variables are used by this service.

| Variable | Description | Required | Default |
| :--- | :--- | :--- | :--- |
| `CLEAN` | Set if the output directory should be deleted and re-created before generating manifest files | yes | `false` |
| `OUTPUT` | Set output directory | no | `/generated` |
| `SAVE` | Sets if the generated manifest files are saved to the output diretory or not | yes | `true` |
| `PATTERN` | Set the pattern to search for cluster files | yes | `/manifests/**/*-cluster.yaml` |

## Contributing

See the [Contributing guide](/CONTRIBUTING.md) for steps on how to contribute to this project.
