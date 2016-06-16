"use strict";

const Promise = require("bluebird");
const rp = require("request-promise");


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
  	return Promise.resolve({
        ENV_ONE: "value-one",
        ENV_TWO: "value-two",
        ENV_THREE: "value-three"
      });

	}
}

module.exports = FileConfig;
