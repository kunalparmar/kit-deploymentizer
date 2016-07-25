
"use strict";

var expect = require("chai").expect;
const Deploymentizer = require("../../../src/lib/deploymentizer");
const Promise = require("bluebird");

describe("Deploymentizer", () =>  {
	describe("configuration", () =>  {
		it("should parse conf", () => {
			const conf = {
				base: { path: "/test/fixture"},
				output: { path: "/generated"},
				cluster: { path: "/test/fixture/clusters"},
				images: { path: "/test/fixture/images"},
				type: { path: "/test/fixture/type"},
				resources: { path: "/test/fixture/resources"},
			}
      let options = {
        save: false,
        clean: true,
        conf: conf
      };
      const deploymentizer = new Deploymentizer(options);
      console.log(deploymentizer.paths);
      expect(deploymentizer.paths.base).to.equal("/test/fixture");
      expect(deploymentizer.paths.output).to.equal("/generated");
      expect(deploymentizer.paths.cluster).to.equal("/test/fixture/clusters");
      expect(deploymentizer.paths.images).to.equal("/test/fixture/images");
      expect(deploymentizer.paths.type).to.equal("/test/fixture/type");
      expect(deploymentizer.paths.resources).to.equal("/test/fixture/resources");
		});
		it("should fail with invalid conf", (done) => {
			const conf = {
				base: { path: "/test/fixture"},
				output: undefined,
				cluster: { path: "/test/fixture/clusters"},
				images: { path: "/test/fixture/images"},
				type: { path: "/test/fixture/type"},
				resources: { path: "/test/fixture/resources"},
			}
      let options = {
        save: false,
        clean: true,
        conf: "/test/fixture/bad-kit.yaml"
      };
			try {
	      const deploymentizer = new Deploymentizer(options);
	      done(new Error("Should have failed"));
			} catch (e) {
				done();
			}
		});
	});
});
