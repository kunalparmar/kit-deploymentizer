"use strict";

var _ = require("lodash");

// Checks for arrays with objects that have the `name` property, and if found
// then it attempts to merge those objects using the `name` as a unique key
function mergeArrayNames(objValue, srcValue) {
	if (_.isArray(objValue) && _.isArray(srcValue) && srcValue.length && srcValue[0].name) {
		var result = _.cloneDeep(objValue);
		_.each(srcValue, function(val) {
			var exists = _.find(result, {name: val.name});
			if (exists) {
				// Merge the src value over the one that exists
				// already (recursively checking for array name objects)
				_.mergeWith(exists, val, mergeArrayNames);
			} else {
				// Append new src value
				result.push(val);
			}
		});
		return result;
	}
}

module.exports = {
	default: mergeArrayNames,
	reverse: function(objValue, srcValue) {
		return mergeArrayNames(srcValue, objValue);
	}
};
