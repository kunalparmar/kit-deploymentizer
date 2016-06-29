"use strict";

const Promise = require("bluebird");
const rp = require("request-promise");
const eventHandler = require("../util/event-handler");

// assumes complete URL except service, and env param
const URL = process.env.ENV_API_HOST;
const TOKEN = process.env.ENV_API_TOKEN;

(function() {
  if (!URL || !TOKEN) {
    throw new Error("The ENV_API_HOST and ENV_API_TOKEN environment vars are required.");
  }
}());

class EnvApiClient {

/**
 *
 * Requires the ENV_API_HOST and ENV_API_TOKEN to be set. Expects JSON results in
 * the format of:
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
 *
 * }
 *
 * @param  {[type]} serviceName [description]
 * @param  {[type]} environment [description]
 * @param  {[type]} cluster     [description]
 * @return {[type]}             [description]
 */
	static fetch( serviceName, environment, cluster ) {
    return Promise.coroutine(function* () {
      const uri = `${URL}/${serviceName}`;
      const options = {
        uri: uri,
        qs: { env: environment },
        headers: { 'X-Auth-Token': TOKEN },
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
    })().catch(function (err) {
      // API call failed...
      eventHandler.emitFatal(`Unable to fetch or convert ENV Config ${JSON.stringify(err)}`);
      throw err;
    });
	}

}

module.exports = EnvApiClient;
