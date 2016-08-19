"use strict";

var expect = require("chai").expect;
const Promise = require("bluebird");

describe("File Configuration plugin", () =>  {

	const FileConfig = require("../../../src/plugin/file-config");
  const fileConfig = new FileConfig({configPath: "./test/fixture/config"});

	console.log(fileConfig);
	describe("Load", () =>  {
		it("should load configuration object", (done) => {
			Promise.coroutine(function* () {
				const config = yield fileConfig.fetch( "service", "environment", "example" )
				expect(config).to.exist;
				expect(config.branch).to.exist;
				expect(config.branch).to.equal("develop");
				expect(config.env).to.exist;
				expect(config.env).to.include({ "name": "ENV_ONE", "value": "value one"});
				expect(config.env).to.include({ "name": "ENV_TWO", "value": "value two"});
				expect(config.env).to.include({ "name": "ENV_THREE", "value": "value three"});
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
