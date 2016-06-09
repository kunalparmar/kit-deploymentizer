"use strict";

var _ = require("lodash");
var EventEmitter = require("events");
var Promise = require("bluebird");
var generator = require("../utils/generator");
var saveCluster = require("../utils/save-cluster");
var mkdirp = Promise.promisify(require("mkdirp"));
var rimraf = Promise.promisify(require("rimraf"));

class DeploymentizerEmitter extends EventEmitter {}

class Deploymentizer {
	constructor(options) {
		this.options = _.merge({
			clean: false,
			save: false,
			output: undefined
		}, options);
		this.events = new DeploymentizerEmitter();
	}

	generate(pattern) {
		var self = this;
		return new Promise(function(resolve, reject) {
			try {
				// Run the generator
				var clusters = generator(pattern);
				self.events.emit("info", "Found " + clusters.length + " cluster files");

				// Clean directory (if enabled)
				var cleanPromise = Promise.resolve();
				if (self.options.clean) {
					self.events.emit("info", "Cleaning output directory: " + self.options.output);
					cleanPromise = rimraf(self.options.output);
				}

				cleanPromise
					.then(function() {
						// Make output dir if it doesn't exist
						self.events.emit("info", "Generating output directory: " + self.options.output);
						return mkdirp(self.options.output);
					})
					.then(function() {
						// Save the cluster files to disk
						if (self.options.save) {
							self.events.emit("info", "Saving manifest files to '" + self.options.output + "'...");
							var promises = [];
							_.each(clusters, function(cluster) {
								var promise = saveCluster(self.options.output, cluster)
									.then(function() {
										self.events.emit("info", "Successfully generated manifests files for '" + cluster.metadata.name + "'");
									});
								promises.push(promise);
							});

							return Promise
								.all(promises)
								.then(function() {
									self.events.emit("info", "Successfully generated all manifest files");
								});
						} else {
							self.events.emit("info", "Successfully parsed cluster files, but did not save any manifest files");
						}
					})
					.then(function() {
						resolve(0);
					})
					.catch(function(err) {
						self.events.emit("fatal", err);
						reject(err);
					});
			} catch (err) {
				self.events.emit("fatal", err);
				reject(err);
			}
		});
	}
}

module.exports = Deploymentizer;
