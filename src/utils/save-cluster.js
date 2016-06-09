"use strict";

var fs = require("fs");
var logger = require("log4js").getLogger();
var Promise = require("bluebird");
var writeFileAsync = Promise.promisify(fs.writeFile);
var _ = require("lodash");
var path = require("path");
var yaml = require("js-yaml");

function save(dir, cluster) {
	var promises = [];

	// Try to make directory if it doesn't exist yet
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	// Group by cluster directory
	var clusterDir = path.join(dir, cluster.metadata.name);
	if (!fs.existsSync(clusterDir)) {
		fs.mkdirSync(clusterDir);
	}

	_.each(cluster.spec, function(obj) {
		var file = path.join(clusterDir, obj.metadata.name + ".yaml");
		var content = yaml.safeDump(obj);
		promises.push(writeFileAsync(file, content, "utf8").then(function() {
			logger.info("Created '" + file + "'");
		}));
	});
	return Promise.all(promises);
}

module.exports = save;
