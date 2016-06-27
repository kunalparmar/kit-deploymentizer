"use strict";

var fs = require("fs");
var logger = require("log4js").getLogger();
var Promise = require("bluebird");
var writeFileAsync = Promise.promisify(fs.writeFile);
var _ = require("lodash");
var path = require("path");
var yaml = require("js-yaml");

function save(dir, cluster) {
	return new Promise((resolve, reject) => {
		// Try to make directory if it doesn't exist yet
		fs.mkdir(dir, (err) => {
			if (err && err.code !== "EEXIST") {
				return reject(err);
			}

			var promises = [];

			// Group by cluster directory
			var clusterDir = path.join(dir, cluster.metadata.name);
			fs.mkdir(clusterDir, (clusterDirErr) => {
				if (clusterDirErr && clusterDirErr.code !== "EEXIST") {
					return reject(clusterDirErr);
				}

				_.each(cluster.spec, function(obj) {
					var file = path.join(clusterDir, obj.metadata.name + ".yaml");
					var content = yaml.safeDump(obj);
					promises.push(writeFileAsync(file, content, "utf8").then(function() {
						logger.info("Created '" + file + "'");
					}));
				});

				Promise
					.all(promises)
					.then(resolve)
					.catch(reject);
			});
		});
	});
}

module.exports = save;
