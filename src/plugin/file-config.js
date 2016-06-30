"use strict";

const fse = require("fs-extra");
const path = require("path");
const Promise = require("bluebird");

const readFilePromise = Promise.promisify(fse.readFile);

class FileConfig {

/**
 * Example path for loading env configuration files:
 *   /auth/production/cluster-env.yaml
 *
 * Requires a env called CONFIGURATION_PATH set with the base path to load
 * the env files from.
 *
 * @param  {[type]} serviceName [description]
 * @param  {[type]} environment [description]
 * @param  {[type]} cluster     [description]
 * @return {[type]}             [description]
 */
	static fetch( serviceName, environment, cluster ) {
    return Promise.coroutine(function* () {
			if (!process.env.CONFIGURATION_PATH) {
				throw new Error("CONFIGURATION_PATH must be set");
			}
			if ( !serviceName || !environment || !cluster ) {
				throw new Error("Missing argument, all values are required.");
			}

			let file = path.join( process.env.CONFIGURATION_PATH, serviceName, environment, `${cluster}-env.json` );
			const data = yield readFilePromise(file, "utf8");
      let config = JSON.parse( data );
      return config;
    })();
	}
}

module.exports = FileConfig;
