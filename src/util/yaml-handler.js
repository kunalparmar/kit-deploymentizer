"use strict";

const fse = require("fs-extra");
const Promise = require("bluebird");
const path = require("path");
const yaml = require("js-yaml");
const glob = require("glob");
const ClusterDefinition = require("../lib/cluster-definition");
const logger = require("log4js").getLogger();
const fseWriteFile = Promise.promisify(fse.writeFile);
const fseReadFile = Promise.promisify(fse.readFile);
const fseReadDir = Promise.promisify(fse.readdir);

// Static class for handling Files.
class YamlHandler {

	// Sync loads a yaml file into a JSOn Object, returning the new Object.
	static loadFileSync(file) {
		// Parse the yaml file to JSON
		return yaml.safeLoad(fse.readFileSync(file, "utf8"));
	}

	static loadFile(file) {
		// Parse the yaml file to JSON,
		return fseReadFile(file, "utf8").then( (fileContent) => {
			return yaml.safeLoad(fileContent);
		});
	}

	/**
	 * Loads all the image files into a set of nested objects
	 * based on resource name and type:
	 * {
	 *   node-auth: { develop: {}, test: {}, release: {} },
	 *   node-activity: { develop: {}, test: {}, release: {} },
	 *   ...
	 * }
	 * @param  {[type]} basePath [description]
	 * @return {{}}     complex object accessable by resource.type.image as Promise
	 */
	static loadImageDefinitions(basePath) {
		return Promise.coroutine(function* () {
  		const dirs = fse.readdirSync(basePath);
  		let imageResourceDefs = {};
      for (let d=0; d < dirs.length; d++ ) {
        // loop through the directories
        const imageResourceName = dirs[d];
  			let resourceImages = {};
  			const files = glob.sync(path.join(basePath, imageResourceName, "*.yaml"));
        // loop through the files adding by name
        for (let f=0; f<files.length; f++) {
  				const name = path.parse(files[f]).name;
  				const image = yield YamlHandler.loadFile(files[f]);
  				resourceImages[name] = image;
        }
  			imageResourceDefs[imageResourceName] = resourceImages;
      }
  		return imageResourceDefs;
    })();
	}

	/**
	 * Loads the various Type definitions into an Associative Array.
	 * @param  {[type]} loadPathPattern path/pattern to load type definitions from, uses glob pattern
	 * @return {{type:definition}} Type Definitions as a Promise result
	 */
	static loadTypeDefinitions(loadPathPattern) {
		return Promise.coroutine(function* () {
  		const files = glob.sync(loadPathPattern);
  		let typeDefs = {};
  		for (let i=0; i < files.length; i++) {
  			const def = yield YamlHandler.loadFile(files[i]);
  			typeDefs[def.metadata.type] = def;
  		};
  		return typeDefs;
    })();
	}

	/**
	 * Loads the base Cluster/Config definitions. Everything is based off these files.
	 * @return {object} Holding base cluster and config values as a Promise
	 */
	static loadBaseDefinitions(loadPath) {
		return Promise.coroutine(function* () {
			const cluster = yield YamlHandler.loadFile(path.join(loadPath, "base-cluster.yaml"));
			const config = yield YamlHandler.loadFile(path.join(loadPath, "base-var.yaml"));
			const cDef = new ClusterDefinition(cluster, config);
			console.log("Base CD %j", cDef);
			return cDef;
		})();
	}

	/**
	 * Loads Cluster Definition Files.
	 * @param  {[type]} basePath directory containing cluster files.
	 * @return {[type]}          Returns a Promise with cluster information.
	 */
	static loadClusterDefinitions(basePath) {
		return fseReadDir(basePath)
			.then( (dirs) => {
				let clusters = [];
				let promises = [];

				dirs.forEach( (dir) => {
					logger.info(`Found Cluster Dir: ${dir}`);
					// If there is not cluster file present, skip directory
					if ( fse.existsSync(path.join(basePath, dir, "cluster.yaml")) ) {
						let p = Promise.join(
              YamlHandler.loadFile(path.join(basePath, dir, "cluster.yaml")),
							YamlHandler.loadFile(path.join(basePath, dir, "configuration-var.yaml")),
							function( cluster, config) {
								return new ClusterDefinition( cluster, config );
							}).then( (clusterDef) => {
								clusters.push(clusterDef);
							});
						promises.push(p);
					} else {
						logger.warn(`No Cluster file found for ${dir}, skipping...`);
					}
				});
				return Promise.all(promises).then( () => { return clusters; });
			});
	}

	/**
	 * Saves a file out to the specified directory
		* @param  {[type]} dir     to save to
		* @param  {[type]} name    name of the file
		* @param  {[type]} content content to save
		* @return {[type]}         returns a Promise
		*/
	static saveResourceFile(dir, name, content) {
		const fileName = path.join(dir, `${name}.yaml`);
		return fseWriteFile(fileName, content);
	}

}

module.exports = YamlHandler;
