"use strict";

const Promise = require("bluebird");

/**
 * Wraps the supplied plugin.
 */
class PluginHandler {

  constructor(pluginPath) {
    this.configService = require(pluginPath);
  }

  /**
   * Invoke the defined Configuration Service returning the result.
   *
   * The values returned from the plugin must match either:
   * 	{ "ENV_NAME": "ENV_VALUE", "ENV_NAME": "ENV_VALUE", ... },
   * 	  or
   * 	[ {name: "ENV_NAME", value: "ENV_VALUE"},{name: "ENV_NAME", value: "ENV_VALUE"}, ...]
   * other formats can be added later.
   *
   * Returned values are converted to the style of:
   * [ {name: "ENV_NAME", value: "ENV_VALUE"},{name: "ENV_NAME", value: "ENV_VALUE"}, ...]
   *
   * @param  {[type]} serviceName to get env values for
   * @param  {[type]} environment that the service will run in
   * @param  {[type]} cluster     that the service will run on
   * @return {[type]}             A promise fulfilled with the ENV values for the given service/env/cluster
   */
  fetch( serviceName, environment, cluster ) {
    // Convert to a Bluebird Promise since we dont know what type we will get back.
    return Promise.resolve(this.configService.fetch( serviceName, environment, cluster ))
      .then( (config) => {
        if (Array.isArray(config)) {
          // TODO: validate format
          return config;
        }
        // convert to correct format
        let result = [];
        Object.keys(config).forEach( (key) => {
          result.push( {
            name: key,
            value: config[key]
          } );
        });
        return result;
      });
  }
}

module.exports = PluginHandler;
