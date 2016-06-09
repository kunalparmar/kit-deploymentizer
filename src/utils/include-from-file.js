"use strict";

var fs = require("fs");
var path = require("path");
var yaml = require("js-yaml");

// Use to check if an object has the "fromFile" and if it does, include the
// file it references
function includeFromFile(file, fromFile) {
	// Get the directory the file is in
	var dir = path.dirname(file);

	var includeFilePath = path.resolve(dir, fromFile);
	var includeFile = yaml.safeLoad(fs.readFileSync(includeFilePath, "utf8"));

	return includeFile;
}

module.exports = includeFromFile;
