"use strict";

const Promise = require("bluebird");
const rp = require("request-promise");
const eventHandler = require("../util/event-handler");

/**
 * Class for accessing the EnvApi Service.
 */
class EnvApiClient {
	
	/**
	 * Requires the apiUrl and apiToken to be set included as parameters.
	 * @param  {[type]} options
	 */
	constructor(options) {
		if (!options.apiUrl || !options.apiToken) {
			throw new Error("Both apiToken and apiUrl are required configuration values.")
		}
		this.apiUrl = options.apiUrl;
		this.apiToken = options.apiToken;
		this.timeout = (options.timeout || 15000);
	}

	/**
	 * The annotation name to look for
	 */
	static get annotationServiceName() {
		return "kit-deploymentizer/env-api-service";
	}

	static get annotationBranchName() {
		return "kit-deploymentizer/env-api-branch";
	}
	/**
	 * The provided service resource needs to contain a annotation specifiying the service name 
	 * to use when invoking the env-api service. If this annotation is not present the request 
	 * is skipped. The annotation is `kit-deploymentizer/env-api-service: [GIT-HUB-PROJECT-NAME]`
	 * 
	 * Another, optional, annotation sets the branch to use by the env-api service. This annotation 
	 * is `kit-deploymentizer/env-api-branch: [GIT-HUB-BRANCH-NAME]` 
	 * 
	 * Expects JSON results in the format of:
	 * {
	 *   env: {
	 *   		ENV_NAME_ONE: ENV_VALUE_ONE,
	 *   		ENV_NAME_TWO: ENV_VALUE_TWO,
	 *   		...
	 *   },
	 *   k8s: {
	 *     other: value,
	 *     ...
	 *   }
	 * }
	 *
	 * @param  {[type]} service     Resource to get envs for  -- checks for correct annotation
	 * @param  {[type]} cluster     the service is running in
	 * @return {[type]}             envs and configuration information
	 */
	fetch( service, cluster ) {
		return Promise.coroutine(function* () {
			if (!service.annotations || !service.annotations[EnvApiClient.annotationServiceName]) {
				eventHandler.emitWarn(`No env-api-service annotation found for ${service.name}`);
				return;
			}
			const uri = `${this.apiUrl}/${service.annotations[EnvApiClient.annotationServiceName]}`;
			let query = { env: cluster };
			// if a branch is specified pass that along
			if (service.annotations || service.annotations[EnvApiClient.annotationBranchName]) {
				query.branch = service.annotations[EnvApiClient.annotationBranchName]
			}
			const options = {
				uri: uri,
				qs: query,
				headers: { 'X-Auth-Token': this.apiToken },
				json: true,
				timeout: this.timeout
			};
			let config = yield rp(options);

			// convert env section to correct format
			let result = {};
			result.env = []
			if ( config.env ) {
				Object.keys(config.env).forEach( (key) => {
					result.env.push({
						name: key,
						value: config.env[key]
					});
				});
			}
			// move the k8s values to the base object
			if (config.k8s && typeof config.k8s === 'object') {
				let props = config.k8s;
				// if we get back a cluster level object, just parse that - otherwise use default
				if (config.k8s[cluster]) {
					props = config.k8s[cluster]
				} 
				Object.keys(props).forEach( (key) => {
					result[key] = props[key];
				});
			}
			return result;
		}).bind(this)().catch(function (err) {
			// API call failed...
			eventHandler.emitFatal(`Unable to fetch or convert ENV Config ${JSON.stringify(err)}`);
			throw err;
		});
	}

}

module.exports = EnvApiClient;
