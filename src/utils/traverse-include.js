"use strict";

var _ = require("lodash");
var includeFromFile = require("./include-from-file");
var mergeArrayNames = require("./merge-array-names").default;
var reverseMergeArrayNames = require("./merge-array-names").reverse;
var path = require("path");

function replaceFromFile(file, obj) {
	function include(fromFile) {
		var fromFilePath = path.resolve(path.dirname(file), fromFile);
		var includeFile = includeFromFile(file, fromFile);
		// Recursive
		traverseInclude(fromFilePath, includeFile);

		// This merges with `obj` overriding values that exists already in the includeFile
		_.mergeWith(includeFile, obj, mergeArrayNames);
		// This does the merge again so that we update the `obj` by reference with the new values
		_.mergeWith(obj, includeFile, reverseMergeArrayNames);
	}

	if (_.isArray(obj.fromFile)) {
		_.each(obj.fromFile, function(fromFile) {
			include(fromFile);
		});
	} else {
		include(obj.fromFile);
	}

	delete obj.fromFile;
}

// Use to traverse all objects and arrays in the provided object and call the
// includeFromFile function to inject the referenced files
function traverseInclude(file, obj) {
	_.forIn(obj, function(val, key) {
		if (key == "fromFile") {
			// Handle fromFile on root structure
			replaceFromFile(file, obj);
		} else if (_.isArray(val)) {
			val.forEach(function(el, index) {
				if (_.isObject(val[index]) || _.isArray(val[index])) {
					// Recursive
					traverseInclude(file, val[index]);
				}
			});
		} else if (_.isObject(obj[key])) {
			// Recursive
			traverseInclude(file, obj[key]);
		}
	});
}

module.exports = traverseInclude;
