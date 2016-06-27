"use strict";

const expect = require("chai").expect;
const saveCluster = require("../../../src/utils/save-cluster");
const path = require("path");
const fs = require("fs");

describe("saveCluster", () => {
	describe("when dirtory does not exist yet", () => {
		const dir = path.resolve("../../tmp");
		const cluster = {
			metadata: {
				name: "testing"
			},
			spec: [
				{
					metadata: {
						name: "service1"
					}
				}
			]
		};

		beforeEach(() => {
			return saveCluster(dir, cluster);
		});
		it("should generate directory with cluster name", () => {
			expect(fs.existsSync(path.join(dir, cluster.metadata.name))).to.be.true;
		});
		it("should work if the directory is already created", () => {
			expect(fs.existsSync(path.join(dir, cluster.metadata.name))).to.be.true;
		});
		it("should generate a yaml file for the service", () => {
			expect(fs.existsSync(path.join(dir, cluster.metadata.name, cluster.spec[0].metadata.name + ".yaml"))).to.be.true;
		});
	});
});
