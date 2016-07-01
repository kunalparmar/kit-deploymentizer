"use strict";

const fse = require("fs-extra");
const path = require("path");
const Promise = require("bluebird");

const readFilePromise = Promise.promisify(fse.readFile);

class FileConfig {

  constructor(options) {
    if (!options.configPath) {
      throw new Error("configPath is a required configuration value.");
    }
    this.configPath = options.configPath;
  }

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
	fetch( serviceName, environment, cluster ) {
    return Promise.coroutine(function* () {
			if ( !serviceName || !environment || !cluster ) {
				throw new Error("Missing argument, all values are required.");
			}

			let file = path.join( this.configPath, serviceName, environment, `${cluster}-env.json` );
			const data = yield readFilePromise(file, "utf8");
      let config = JSON.parse( data );
      return config;
    }).bind(this)();
	}
}

module.exports = FileConfig;
