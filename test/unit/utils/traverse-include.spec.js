var expect = require("chai").expect;
var traverseInclude = require("../../../src/utils/traverse-include");
var fs = require("fs");
var yaml = require("js-yaml");

describe("traverseInclude", function() {
	describe("when passing object without `fromFile` property", function() {
		it("should just return the object with no changes", function() {
			var obj = {
				id: "123",
				age: 21,
				name: "joe"
			};
			traverseInclude("/test/fixture/overriding/cluster.yaml", obj);
			expect(obj).to.deep.equal({
				id: "123",
				age: 21,
				name: "joe"
			});
		});
	});

	describe("when passing object with `fromFile` property", function() {
		it("should return object with the fromFile removed and the file inserted", function() {
			var obj = {
				id: "123",
				age: 21,
				name: "joe",
				fromFile: "./simple.yaml"
			};
			traverseInclude("/test/fixture/test/simple.yaml", obj);
			expect(obj).to.deep.equal({
				id: "123",
				age: 21,
				name: "joe",
				testing: true
			});
		});
	});

	describe("when passing object with nested `fromFile` properties", function() {
		it("should return object with the fromFile removed and the files inserted relative to where they were included", function() {
			var obj = {
				id: "123",
				fromFile: "./nested1/nested1.yaml"
			};
			traverseInclude("/test/fixture/test/nested.yaml", obj);
			expect(obj).to.deep.equal({
				id: "123",
				override: false,
				metadata: {
					nested1: true,
					nested2: true,
					nested3: true
				},
				nestedWithinFile: {
					found: true
				},
				env: [
					{
						name: "OVERRIDE",
						value: "false"
					},
					{
						name: "NESTED",
						value: 1
					}
				],
				nested: {
					env: [
						{
							name: "NESTED_OVERRIDE",
							value: "false"
						},
						{
							name: "NOCHANGE",
							value: "okay"
						}
					]
				}
			});
		});
	});

	describe("when passing object with an array `fromFile` property", function() {
		it("should return object all the fromFile includes in the array", function() {
			var filePath = "/test/fixture/array/root.yaml";
			var obj = yaml.safeLoad(fs.readFileSync(filePath, "utf8"));
			traverseInclude("/test/fixture/array/root.yaml", obj);
			expect(obj).to.deep.equal({
				root: true,
				first: true,
				second: true,
				third: true
			});
		});
	});

	describe("when passing object with overriding nested `fromFile`", function() {
		it("should return object with `fromFile` found first overriding ones found later", function() {
			var filePath = "/test/fixture/order/root.yaml";
			var obj = yaml.safeLoad(fs.readFileSync(filePath, "utf8"));
			traverseInclude(filePath, obj);
			expect(obj).to.deep.equal({
				people: [
					{
						name: "chesley",
						spec: {
							age: 28,
							weight: 59
						}
					}
				]
			});
		});
	});

	describe("when passing object with a nested array `fromFile` property", function() {
		it("should return object all the fromFile includes in the array", function() {
			var filePath = "/test/fixture/array/root-nested.yaml";
			var obj = yaml.safeLoad(fs.readFileSync(filePath, "utf8"));
			traverseInclude(filePath, obj);
			expect(obj).to.deep.equal({
				root: true,
				nested: {
					first: true,
					second: true,
					third: true
				}
			});
		});
	});

	describe("when passing inherit style convention object", function() {
		it("should inherit base and override nested properties", function() {
			var obj = {
				fromFile: "./develop.yaml"
			};
			traverseInclude("/test/fixture/inherit/cluster.yaml", obj);
			expect(obj).to.deep.equal({
				apiVersion: "extensions/v1beta1",
				kind: "Deployment",
				metadata: {
					name: "cfprojectsapi-deployment"
				},
				spec: {
					replicas: 2,
					selector: {
						name: "node-pod"
					},
					template: {
						metadata: {
							labels: {
								name: "node-pod",
								app: "invisionapp"
							}
						},
						spec: {
							containers: [
								{
									name: "node-con",
									image: "node:develop"
								}
							]
						}
					}
				}
			});
		});
	});

	describe("when passing inherit style convention within an array", function() {
		it("should inherit base and override nested properties", function() {
			var obj = [
				{
					fromFile: "./develop.yaml"
				}
			];
			traverseInclude("/test/fixture/inherit/cluster.yaml", obj);
			expect(obj).to.deep.equal([{
				apiVersion: "extensions/v1beta1",
				kind: "Deployment",
				metadata: {
					name: "cfprojectsapi-deployment"
				},
				spec: {
					replicas: 2,
					selector: {
						name: "node-pod"
					},
					template: {
						metadata: {
							labels: {
								name: "node-pod",
								app: "invisionapp"
							}
						},
						spec: {
							containers: [
								{
									name: "node-con",
									image: "node:develop"
								}
							]
						}
					}
				}
			}]);
		});
	});
});
