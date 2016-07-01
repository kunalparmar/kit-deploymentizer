"use strict";

const Promise = require("bluebird");
const rp = require("request-promise");
const eventHandler = require("../util/event-handler");

/**
 * Class for accessing the EnvApi Service.
 */
class EnvApiClient {

  /**
   * Requires the api_url and api_token to be set included as parameters.
   * @param  {[type]} options
   */
  constructor(options) {
    if (!options.api_url || !options.api_token) {
      throw new Error("Both api_token and api_url are required configuration values.")
    }
    this.api_url = options.api_url;
    this.api_token = options.api_token;
  }

  /**
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
   * @param  {[type]} serviceName to get envs for
   * @param  {[type]} environment the service is running in
   * @param  {[type]} cluster     the service is running in
   * @return {[type]}             envs and configuration information
   */
	fetch( serviceName, environment, cluster ) {
    return Promise.coroutine(function* () {
      const uri = `${this.api_url}/${serviceName}`;
      const options = {
        uri: uri,
        qs: { env: environment },
        headers: { 'X-Auth-Token': this.api_token },
        json: true
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
        Object.keys(config.k8s).forEach( (key) => {
          result[key] = config.k8s[key];
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
