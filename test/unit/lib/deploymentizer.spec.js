
"use strict";

var expect = require("chai").expect;
const Deploymentizer = require("../../../src/lib/deploymentizer");
const Promise = require("bluebird");

describe("Deploymentizer", () =>  {
	describe("configuration", () =>  {
		it("should find conf", (done) => {
      Promise.coroutine(function* () {
        let options = {
          save: false,
          clean: true,
          conf: "/test/fixture/kit.yaml"
        };
        const deploymentizer = new Deploymentizer(options);
        yield deploymentizer.loadConf();
        console.log(deploymentizer.paths);
        expect(deploymentizer.paths.base).to.equal("/test/fixture");
        expect(deploymentizer.paths.output).to.equal("/generated");
        expect(deploymentizer.paths.cluster).to.equal("/test/fixture/clusters");
        expect(deploymentizer.paths.images).to.equal("/test/fixture/manifests/images");
        expect(deploymentizer.paths.type).to.equal("/test/fixture/type");
        expect(deploymentizer.paths.resources).to.equal("/test/fixture/resources");
        done();
      })().catch( (err) => {
        done(err);
      });
		});
		it("should fail with invalid conf", (done) => {
      Promise.coroutine(function* () {
        let options = {
          save: false,
          clean: true,
          conf: "/test/fixture/bad-kit.yaml"
        };
        const deploymentizer = new Deploymentizer(options);
        yield deploymentizer.loadConf();
        done(new Error("Should have failed"));
      })().catch( (err) => {
        done();
      });
		});
	});
});
