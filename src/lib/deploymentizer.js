"use strict";

const _ = require("lodash");
const Promise = require("bluebird");
const Generator = require("./generator");
const yamlHandler = require("../util/yaml-handler");
const eventHandler = require("../util/event-handler");
const PluginHandler = require("../util/plugin-handler");
const fse = require("fs-extra");
const fseRemove = Promise.promisify(fse.remove);

/**
 * Main class used to process deployment files converting templates into deployable manifests.
 */
class Deploymentizer {
	constructor(options) {
		this.options = _.merge({
			clean: false,
			save: false,
			loadPath: undefined,
			outputPath: undefined,
      configPlugin: undefined
		}, options);
		this.events = eventHandler;
	}

	/**
	 * Main entrypoint. Handles loading var files and cluster definitions. These
	 * are merged before rendering the deployment manifests.
	 */
	process() {
		return Promise.coroutine(function* () {
  		this.events.emitInfo(`Initialization: ${JSON.stringify(this.options)}`);

  		if (this.options.clean) {
  			this.events.emitInfo(`Cleaning: ${this.options.outputPath}/*`);
  			yield fseRemove(`${this.options.outputPath}/*`);
  		}

  		this.events.emitInfo(`Processing directory: ${this.options.loadPath}`);

			const baseClusterDef = yield yamlHandler.loadBaseDefinitions(this.options.loadPath);
			this.events.emitInfo("Loaded base cluster definition");

			// Load the type configs into their own Map
			const typeDefinitions = yield yamlHandler.loadTypeDefinitions(`${this.options.loadPath}/type/*-var.yaml`);

			// Load image tag (usage based on Resource Spec or cluster spec
			// TODO : Remove hardcoded - load from kit.yaml
			const imageResources = yield yamlHandler.loadImageDefinitions(`${this.options.loadPath}/images/invision`);

      const configPlugin = new PluginHandler(this.options.configPlugin);
			// Load the /cluster 'cluster.yaml' and 'configuration-var.yaml'
			const clusterDefs = yield yamlHandler.loadClusterDefinitions(`${this.options.loadPath}/clusters`)

			//Merge the definitions, render templates and save (if enabled)
  		for (let i=0; i < clusterDefs.length; i++) {
        yield this.processClusterDef( clusterDefs[i], typeDefinitions, baseClusterDef, imageResources, configPlugin )
  		};
			this.events.emitInfo(`Finished processing files...` );
		}).bind(this)();
	}

	/**
	 * Process files for a given cluster. This includes merging configuration files, and rendering templates.
	 *
	 * @param  {[type]} def             Cluster Definition
	 * @param  {[type]} typeDefinitions Map of Type configuration
	 * @param  {[type]} baseClusterDef  Base Cluster Definition
	 * @param  {[type]} imageResources  ImageResource Map
	 */
	processClusterDef(def, typeDefinitions, baseClusterDef, imageResources, configPlugin) {
		return Promise.try( () => {
			if (def.type()) {
				const type = typeDefinitions[def.type()];
				if (!type) { throw new Error(`UnSupported Type ${def.type()}`); }
				// Merge the type definition then the base definition
				def.apply(type);
			} else {
				this.events.emitWarn(`No Type configured for cluster ${def.name()}, skipping` );
			}
			// Merge with the Base Definitions.
			def.apply(baseClusterDef);
			this.events.emitInfo("Done Merging Cluster Definitions");
			// apply the correct image tag based on cluster type or resource type
			// generating the templates for each resource (if not disabled), using custom ENVs and envs from resource tags.
			// Save files out
			const generator = new Generator(def, imageResources,
                                      this.options.loadPath,
                                      this.options.outputPath,
                                      this.options.save,
                                      configPlugin);
			return generator.process();
		});
	}
}

module.exports = Deploymentizer;
