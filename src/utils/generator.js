"use strict";

var _ = require("lodash");
var fs = require("fs");
var glob = require("glob");
var yaml = require("js-yaml");
var traverseInclude = require("./traverse-include");

module.exports = function(pattern) {
	var clusters = [];

	var files = glob.sync(pattern);

	if (!files.length) {
		throw new Error("No files found using pattern: '" + pattern + "'");
	}
	_.each(files, function(file) {
		// Parse the cluster yaml file to JSON
		var cluster = yaml.safeLoad(fs.readFileSync(file, "utf8"));

		// Verify is correct kind
		if (cluster.kind != "Cluster") {
			throw new Error("Expected kind: 'Cluster', found kind: '" + cluster.kind + "' for '" + file + "'");
		}
		if (!_.has(cluster, ["metadata", "name"])) {
			throw new Error("Missing required 'metadata.name' property for '" + file + "'");
		}

		traverseInclude(file, cluster);
		clusters.push(cluster);
	});

	return clusters;
};
