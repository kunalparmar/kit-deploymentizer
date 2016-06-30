
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
        done();
      })().catch( (err) => {
        done(err);
      });
		});
	});
});
