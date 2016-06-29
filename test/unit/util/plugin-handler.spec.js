"use strict";

var expect = require("chai").expect;
const Promise = require("bluebird");
const PluginHandler = require("../../../src/util/plugin-handler");

process.env.CONFIGURATION_PATH = "./test/fixture/config";

describe("PluginHandler", () =>  {

	describe("Load", () =>  {

		it("Should load the pluginHandler", () => {
			const handler = new PluginHandler("../../../src/plugin/file-config");
			expect(handler).to.exist;
		});

		it("should load configuration object", (done) => {
			Promise.coroutine(function* () {
				const handler = new PluginHandler("../../../src/plugin/file-config");
				expect(handler).to.exist;
				const config = yield handler.fetch( "service", "environment", "example" )
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

		it("should not fail even with file not found", (done) => {
			Promise.coroutine(function* () {
				const handler = new PluginHandler("../../../src/plugin/file-config");
				expect(handler).to.exist;
				const config = yield handler.fetch( "service", "environment", "not-here" )
				done();
			})().catch( (err) => {
				done(err);
			});
		});

	});

});
