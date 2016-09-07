"use strict";

var expect = require("chai").expect;
const Promise = require("bluebird");
const PluginHandler = require("../../../src/util/plugin-handler");

describe("PluginHandler", () =>  {

	describe("Load", () =>  {

		it("Should load the pluginHandler", () => {
      const options = { configPath: "./test/fixture/config" }
			const handler = new PluginHandler("../../../src/plugin/file-config", options);
			expect(handler).to.exist;
		});

		it("should load configuration object", (done) => {
			Promise.coroutine(function* () {
        const options = { configPath: "./test/fixture/config" }
  			const handler = new PluginHandler("../../../src/plugin/file-config", options);
				expect(handler).to.exist;
				const config = yield handler.fetch( { name: "service" }, "example" )
				expect(config).to.exist;
				expect(config.env).to.exist;
				expect(config.branch).to.exist;
				expect(config.branch).to.equal("develop");
				expect(config.env.length).to.equal(3);
				expect(config.env).to.include({name: "ENV_ONE", value: "value one"})
				expect(config.env).to.include({name: "ENV_TWO", value: "value two"})
				expect(config.env).to.include({name: "ENV_THREE", value: "value three"})
				done();
			})().catch( (err) => {
				done(err);
			});
		});

		it("should fail with file not found", (done) => {
			Promise.coroutine(function* () {
        const options = { configPath: "./test/fixture/config" }
  			const handler = new PluginHandler("../../../src/plugin/file-config", options);
				expect(handler).to.exist;
				const config = yield handler.fetch( { name: "service" }, "not-here" )
				done(err);
			})().catch( (err) => {
				done();
			});
		});

	});

});
