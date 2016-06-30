
"use strict";

var expect = require("chai").expect;
const Deploymentizer = require("../../../src/lib/deploymentizer");
const Promise = require("bluebird");

describe("Deploymentizer", () =>  {
	describe("configuration", () =>  {
		it("should find default conf", (done) => {
      Promise.coroutine(function* () {
        let options = {
          save: false,
          clean: true,
          loadPath: "/test/fixture"
        };
        const deploymentizer = new Deploymentizer(options);
        yield deploymentizer.loadConf();
        console.log(deploymentizer.paths);
        expect(deploymentizer.paths.base).to.equal("/test/fixture");
        expect(deploymentizer.paths.output).to.equal("/generated");
        expect(deploymentizer.paths.cluster).to.equal("./clusters");
        expect(deploymentizer.paths.images).to.equal("./manifests/images");
        expect(deploymentizer.paths.type).to.equal("./type");
        expect(deploymentizer.paths.resources).to.equal("./resources");
        done();
      })().catch( (err) => {
        done(err);
      });
		});
	});
});
