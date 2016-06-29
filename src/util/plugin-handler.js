"use strict";

const Promise = require("bluebird");
const eventHandler = require("./event-handler");

/**
 * Wraps the supplied plugin.
 */
class PluginHandler {

  /**
   * Load the plugin defined
   * @param  {[type]} pluginPath [description]
   * @return {[type]}            [description]
   */
  constructor(pluginPath) {
		this.configService = require(pluginPath);
  }

	/**
	 * Invoke the defined Configuration Service returning the result.
	 *
	 * The Object returned from the plugin must match :
	 *  {
	 * 	 env: [ {name: "ENV_NAME", value: "ENV_VALUE"},{name: "ENV_NAME", value: "ENV_VALUE"}, ...],
	 * 	 branch: "BRANCH-NAME",
	 * 	 ...
	 *  }
	 * other formats can be added later.
	 *
	 * @param  {[type]} serviceName to get env values for
	 * @param  {[type]} environment that the service will run in
	 * @param  {[type]} cluster     that the service will run on
	 * @return {[type]}             A promise fulfilled with the ENV values for the given service/env/cluster
	 */
	fetch( serviceName, environment, cluster ) {
		// Convert to a Bluebird Promise since we dont know what type we will get back.
		return Promise.resolve(
        this.configService.fetch( serviceName, environment, cluster )
      ).catch( (err) => {
        eventHandler.emitWarn(`Configuration could not be loaded for ${serviceName} in ${environment} for cluster ${cluster}`);
        return {};
      });
	}
}

module.exports = PluginHandler;
