"use strict";

const _ = require("lodash");
const path = require("path");
const Promise = require("bluebird");
const yamlHandler = require("../util/yaml-handler");
const resourceHandler = require("../util/resource-handler");
const logger = require("log4js").getLogger();
const fse = require("fs-extra");
const fseCopy = Promise.promisify(fse.copy);

/**
 * Creates the cluster directory if it already does not exist. Sync operation.
 * @param  {string} path to directory to create
 */
function createClusterDirectory(clusterPath) {
	// Try to make directory if it doesn't exist yet
	if (!fse.existsSync(clusterPath)) {
		fse.mkdirsSync(clusterPath);
	}
}

/**
 * Returns the file informtion including type based on ext and name.
 * @param  {[type]} file string containing the file name and ext.
 * @return {{extension, name}}      extention of the file indicating type.
 */
function fileInfo(file) {
	return path.parse(file);
}

/**
 * Manages generation of files for a given cluster definition.
 */
class Generator {

	constructor(clusterDef, imageResourceDefs, basePath, exportPath, save) {
		if (!clusterDef) throw new Error("Valid ClusterDefinition is required");
		if (!imageResourceDefs) throw new Error("Valid imageResourceDefinitions are required");
		if (!basePath || basePath.length < 1) throw new Error("Valid BasePath is required");
		if (!exportPath || exportPath.length < 1) throw new Error("Valid exportPath is required");
		this.options = {
			clusterDef: clusterDef,
			imageResourceDefs: imageResourceDefs,
			basePath: basePath,
			exportPath: path.join(exportPath, clusterDef.name()),
			save: (save || false)
		};
	}

	/**
	 * Processes a given Cluster Definition, creating all the required files by
	 *   rendering the resource and service templates.
	 *
	 * Returns a Promise fulfilled after saving file(s)
	 */
	process() {
		// Create the output directory if it already does not exist.
		createClusterDirectory(this.options.exportPath);
		const resources = this.options.clusterDef.resources();
		let promises = [];

		Object.keys(resources).forEach( (resourceName) => {
			let resource = resources[resourceName];
			if (resource.disable === true) {
				logger.warn(`Resource ${resourceName} is disabled, skipping...`);
			} else {
				// render template
				if (resource.file) {
					const fileStats = fileInfo(resource.file);
					switch (fileStats.ext) {
						case ".yaml":
							// YAML files do not need any processing - copy file to output directory
							promises.push( this.processCopyResource(resource, fileStats) );
							break;
						case ".mustache":
							// process and render template
							promises.push( this.processResource(resource, resourceName, fileStats) );
							break;
						default:
							throw new Error(`Unknown file type: ${fileStats.ext}`);
					}
				}
			}
		});
		return Promise.all(promises).then( (results) => {
			console.log("%j", results);
			return;
		});
	}

	/**
	 * Creates a local clone of the configuration object for a given resource.
	 * @param  {[type]} config       Initial configuration object
	 * @param  {[type]} resourceName Name of the resource
	 * @param  {[type]} resource
	 * @return {{}}              cloned copy of the configuration with resource specific attributes added.
	 */
	_createLocalConfiguration(config, resourceName, resource) {
		const branch = (resource.branch || this.options.clusterDef.branch());
		let localConfig = _.cloneDeep(config);
		// Add the ResourceName to the config object.
		localConfig.name = resourceName;
		// Check to see if the specific resource has its own envs and merge if needed.
		if (resource.env) {
			// Process any external ENV values before merging.
			const env = resourceHandler.mergeEnvs(localConfig.env, resourceHandler.loadExternalEnv( resource.env ));
			logger.info(`Envs: ${JSON.stringify(env)}`);
			localConfig.env = env;
			logger.info(`Local Config with Envs: ${JSON.stringify(localConfig)}`);
		}

		// Find the image tag name (may be different than resource name)
		let imageTag = ( resource.image_tag || resourceName);
		if ( !this.options.imageResourceDefs[imageTag] || !this.options.imageResourceDefs[imageTag][branch] ) {
			throw new Error(`Image ${imageTag} not for for defined branch ${branch}`);
		}
		localConfig.image = this.options.imageResourceDefs[imageTag][branch].image;
		// if service info, append
		if (resource.svc) {
			localConfig.svc = resource.svc;
		}
		return localConfig;
	}

	/**
	 * Generates a local config and renders the resource file and saves to the output directory.
	 * @param  {[type]} resource  to process
	 * @param  {[type]} config    data to use when rendering templat
	 * @param  {[type]} fileStats file information
	 * @return {[type]}           [description]
	 */
	processResource(resource, resourceName, fileStats) {
		return Promise.coroutine( function* () {
			// Create local config for each resource, includes local envs, svc info and image tag
			let localConfig = this._createLocalConfiguration(this.options.clusterDef.configuration(), resourceName, resource);
			yield this.processService(resource, localConfig);

			logger.info(`Processing Resource ${fileStats.base}`);
			let resourceTemplate = fse.readFileSync( path.join(this.options.basePath, resource.file), "utf8");
			const resourceYaml = resourceHandler.render(resourceTemplate, _localConfig);
			if (this.options.save === true) {
				yield yamlHandler.saveResourceFile(this.options.exportPath, fileStats.name, resourceYaml);
			} else {
				logger.info(`Saving is disabled, skipping ${fileStats.name}`);
				return;
			}
		})();
	}

	/**
	 * Copys the file from the current location to the output location
	 * @param  {[type]} resource  containing the file path to copy
	 * @param  {[type]} fileStats file information
	 * @return {[type]}           [description]
	 */
	processCopyResource(resource, fileStats) {
		return Promise.try( () => {
			logger.info(`Copying file from ${path.join(this.options.basePath, resource.file)} to ${path.join(this.options.exportPath, fileStats.base)}`);
			if (this.options.save === true) {
				return fseCopy(path.join(this.options.basePath, resource.file), path.join(this.options.exportPath, fileStats.base));
			} else {
				logger.info(`Saving is disabled, skipping ${fileStats.name}`);
				return;
			}
		});
	}

	/**
	 *
	 * @param  {[type]} resource    [description]
	 * @param  {[type]} localConfig [description]
	 * @return {[type]}             [description]
	 */
	processService(resource, config) {
		return Promise.try( () => {
			// There may not be a service associated with this
			if (! resource.svc) return;
			logger.info(`Processing Service ${resource.svc.name}`);
			const serviceTemplate = fse.readFileSync(path.join(this.options.basePath, "resources", "base-svc.mustache"), "utf8");
			const svcYaml = resourceHandler.render(serviceTemplate, config);
			if (this.options.save === true) {
				return yamlHandler.saveResourceFile(this.options.exportPath, resource.svc.name, svcYaml);
			} else {
				logger.info(`Saving is disabled, skipping ${resource.svc.name}`);
				return;
			}
		});
	}

}

module.exports = Generator;
