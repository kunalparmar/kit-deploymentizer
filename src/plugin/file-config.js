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
 * Requires a CONFIGURATION_PATH with the base path for
 *
 * @param  {[type]} serviceName [description]
 * @param  {[type]} environment [description]
 * @param  {[type]} cluster     [description]
 * @return {[type]}             [description]
 */
  static fetch( serviceName, environment, cluster ) {

    return Promise.try( () => {
      if (!process.env.CONFIGURATION_PATH) {
        throw new Error("CONFIGURATION_PATH must be set");
      }
      if ( !serviceName || !environment || !cluster ) {
        throw new Error("Missing argument, all values are required.");
      }

      let file = path.join( process.env.CONFIGURATION_PATH, serviceName, environment, `${cluster}-env.json` );

      return readFilePromise(file, "utf8").then( (data) => {
        return JSON.parse( data );
      });
    });

  }
}

module.exports = FileConfig;
