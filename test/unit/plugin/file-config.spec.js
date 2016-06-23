"use strict";

var expect = require("chai").expect;
const Promise = require("bluebird");

process.env.CONFIGURATION_PATH = "./test/fixture/config";

describe("File Configuration plugin", () =>  {

	const fileConfig = require("../../../src/plugin/file-config");
	console.log(fileConfig);
	describe("Load", () =>  {
		it("should load configuration object", (done) => {
			Promise.coroutine(function* () {
				const config = yield fileConfig.fetch( "service", "environment", "example" )
				expect(config).to.exist;
				expect(config.ENV_ONE).to.equal("value one");
				expect(config.ENV_TWO).to.equal("value two");
				expect(config.ENV_THREE).to.equal("value three");
				done();
			})().catch( (err) => {
				done(err);
			});
		});

		it("should fail with file not found", (done) => {
			Promise.coroutine(function* () {
				const config = yield fileConfig.fetch( "service", "environment", "not-here" )
				done(new Error("Should faile with file not found"));
			})().catch( (err) => {
				done();
			});
		});

	});

});
