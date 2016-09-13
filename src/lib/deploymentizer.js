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


const resolve = function(workdir, pathStr) {
		if (!pathStr) {
			return undefined;
		}
		return path.resolve(workdir, pathStr);
}

/**
 * Main class used to process deployment files converting templates into deployable manifests.
 */
class Deploymentizer {
	constructor(args) {
		// define require fields
		this.paths = {
			base: undefined,
			output: undefined,
			cluster: undefined,
			images: undefined,
			type: undefined,
			resources: undefined
		}
		this.options = {
				clean: (args.clean || false),
				save: (args.save || false),
				workdir: (args.workdir || ""),
				configPlugin: undefined,
				conf: undefined,
				resource: (args.resource || undefined)
			}
		this.options.conf = this.parseConf(args.conf);
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
				this.events.emitInfo(`Cleaning: ${path.join(this.paths.output, "/*")}`);
				yield fseRemove(path.join(this.paths.output, "/*"));
			}

			this.events.emitInfo(`Loading base cluster definitions from: ${this.paths.base}`);
			const baseClusterDef = yield yamlHandler.loadBaseDefinitions(this.paths.base);

			// Load the type configs into their own Map
			const typeDefinitions = yield yamlHandler.loadTypeDefinitions(this.paths.type);

			// Load image tag (usage based on Resource Spec or cluster spec
			const imageResources = yield yamlHandler.loadImageDefinitions(this.paths.images);

			let configPlugin = undefined;
			if (this.options.configPlugin) {
				configPlugin = new PluginHandler(this.options.configPlugin.path, this.options.configPlugin.options);
			}
			// Load the /cluster 'cluster.yaml' and 'configuration-var.yaml'
			const clusterDefs = yield yamlHandler.loadClusterDefinitions(this.paths.cluster);

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
	parseConf(conf) {
		if (conf) {
			this.paths.base = resolve(this.options.workdir, conf.base.path);
			this.paths.output = resolve(this.options.workdir, conf.output.path);
			this.paths.cluster = resolve(this.options.workdir, conf.cluster.path);
			this.paths.resources = resolve(this.options.workdir, conf.resources.path);
			this.paths.type = resolve(this.options.workdir, conf.type.path);
			this.paths.images = resolve(this.options.workdir, conf.images.path);
			if (conf.plugin) {
				this.options.configPlugin = conf.plugin;
				this.options.configPlugin.path = conf.plugin.path;
			}
			Object.keys(this.paths).forEach( (key) => {
				if (!this.paths[key]) {
					throw new Error (`Missing required value: ${key}`);
				}
			});
		} else {
			throw new Error("No Configuration object.");
		}
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
			if (def.disabled()) {
				this.events.emitInfo(`Cluster ${def.name()} is disabled, skipping`);
				return;
			} else {
				// apply the correct image tag based on cluster type or resource type
				// generating the templates for each resource (if not disabled), using custom ENVs and envs from resource tags.
				// Save files out
				const generator = new Generator(def, imageResources,
																				this.paths.resources,
																				this.paths.output,
																				this.options.save,
																				configPlugin,
																				this.options.resource);
				return generator.process();
			}
		});
	}
}

module.exports = Deploymentizer;
