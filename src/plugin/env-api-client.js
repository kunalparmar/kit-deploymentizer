"use strict";

const Promise = require("bluebird");
const rp = require("request-promise");
const logger = require("log4js").getLogger();

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
 * Requires a CONFIGURATION_PATH with the base path for
 *
 * @param  {[type]} serviceName [description]
 * @param  {[type]} environment [description]
 * @param  {[type]} cluster     [description]
 * @return {[type]}             [description]
 */
	static fetch( serviceName, environment, cluster ) {
    const uri = `${URL}/${serviceName}`;
    const options = {
      uri: uri,
      qs: {
        env: environment
      },
      headers: {
        'X-Auth-Token': TOKEN
      },
      json: true
    };
    console.log("Request :: %j", options);
  	return rp(options)
      .then( (envs) => {
        console.log('Returned %j values', envs);
        return envs;
      })
      .catch(function (err) {
        // API call failed...
        logger.fatal(`Unable to fetch ENVs ${JSON.stringify(err)}`);
        throw err;
      });

	}

}

module.exports = EnvApiClient;
