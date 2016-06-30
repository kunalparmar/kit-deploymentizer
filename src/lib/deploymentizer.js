"use strict";

const _ = require("lodash");
const path = require("path");
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
    if (!options.loadPath && !options.conf) {
      throw new Error("Required loadpath or conf not supplied");
    }
		this.options = _.merge({
  			clean: false,
  			save: false,
        conf: undefined,
        version: "2",
        configPlugin: "./plugin/env-api-client"
  		}, options);
    // set defaults
    this.paths = {
      base: options.loadPath,
      output: options.outputPath,
      cluster: "./clusters",
      images: "./images/invision",
      type: "./type",
      resources: "./resources"
    }
		this.events = eventHandler;
	}

	/**
	 * Main entrypoint. Handles loading var files and cluster definitions. These
	 * are merged before rendering the deployment manifests.
	 */
	process() {
		return Promise.coroutine(function* () {

  		this.events.emitInfo(`Initialization: ${JSON.stringify(this.options)}`);
      yield this.loadConf();

  		if (this.options.clean) {
  			this.events.emitInfo(`Cleaning: ${path.join(this.paths.output, "/*")}`);
  			yield fseRemove(path.join(this.paths.output, "/*"));
  		}

  		this.events.emitInfo(`Processing directory: ${this.paths.base}`);

			const baseClusterDef = yield yamlHandler.loadBaseDefinitions(this.paths.base);
			this.events.emitInfo("Loaded base cluster definition");

			// Load the type configs into their own Map
			const typeDefinitions = yield yamlHandler.loadTypeDefinitions(path.join(this.paths.base, "/type/*-var.yaml"));

			// Load image tag (usage based on Resource Spec or cluster spec
			const imageResources = yield yamlHandler.loadImageDefinitions(path.join(this.paths.base, "/images/invision"));

      const configPlugin = new PluginHandler(this.options.configPlugin);
			// Load the /cluster 'cluster.yaml' and 'configuration-var.yaml'
			const clusterDefs = yield yamlHandler.loadClusterDefinitions(path.join(this.paths.base, "/clusters"));

			//Merge the definitions, render templates and save (if enabled)
  		for (let i=0; i < clusterDefs.length; i++) {
        yield this.processClusterDef( clusterDefs[i], typeDefinitions, baseClusterDef, imageResources, configPlugin )
  		};
			this.events.emitInfo(`Finished processing files...` );
		}).bind(this)();
	}

  /**
   * Load the conf file if available and merge values.
   */
  loadConf() {
    return Promise.coroutine(function* () {
      // if conf is not passed in, set to default location and try that
      this.options.conf = (this.options.conf || path.join(this.paths.base, "kit.yaml"));
      let exists = yield yamlHandler.exists( this.options.conf );
      if (exists) {
        const conf = yield yamlHandler.loadFile(this.options.conf);
        if (conf.version !== this.options.version) {
          throw new Error(`Unsupported version ${conf.version}, expected ${this.options.version}`);
        }
        if (conf.load) {
          if (conf.load.path && ! this.paths.base) {
            this.paths.base = conf.load.path;
          }
          if (conf.load.cluster) {
            this.paths.cluster = conf.load.cluster.path;
          }
          if (conf.load.resources) {
            this.paths.resources = conf.load.resources.path;
          }
          if (conf.load.type) {
            this.paths.type = conf.load.type.path;
          }
          if (conf.load.images) {
            this.paths.images = conf.load.images.path;
          }
        }
        if (conf.output && ! this.paths.output) {
          this.paths.output = conf.output.path;
        }
        if (conf.plugin && !this.options.configPlugin) {
          this.options.configPlugin = conf.plugin.path;
        }
      } else {
        this.events.emitWarn("No Configuration file found.");
      }
      this.events.emitInfo(`Paths set to: ${JSON.stringify(this.paths)}`);
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
                                      this.paths.base,
                                      this.paths.output,
                                      this.options.save,
                                      configPlugin);
			return generator.process();
		});
	}
}

module.exports = Deploymentizer;
