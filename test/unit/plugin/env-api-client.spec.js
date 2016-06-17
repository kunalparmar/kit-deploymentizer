"use strict";

var expect = require("chai").expect;
const Promise = require("bluebird");

describe("ENV API Client Configuration plugin", () =>  {

	describe("Load Client", () =>  {
		it("should fail with validation error", (done) => {
			try {
      	const apiConfig = require("../../../src/plugin/env-api-client");
				done(new Error("Should have failed"));
			} catch(err) {
				done();
			};
		});

		it("should load plugin successfully", (done) => {
      process.env.ENV_API_HOST = "HOST";
      process.env.ENV_API_TOKEN = "TOKEN";
    	const apiConfig = require("../../../src/plugin/env-api-client");
      delete process.env.ENV_API_HOST;
      delete process.env.ENV_API_TOKEN;
			done();
		});
	});

	describe("Run Client", () =>  {

    // Convert to Functional Test

		// it("should fail with validation error", (done) => {
		// 	Promise.coroutine(function* () {
    //     process.env.ENV_API_HOST = "";
    //     process.env.ENV_API_TOKEN = "";
    //   	const apiConfig = require("../../../src/plugin/env-api-client");
    //     const result = yield apiConfig.fetch("test-service", "staging");
    //
    //     console.log(" API Result:: %j", result);
    //     delete process.env.ENV_API_HOST;
    //     delete process.env.ENV_API_TOKEN;
  	// 		done();
		// 	})().catch( (err) => {
		// 		done(err);
		// 	});
		// });
	});
});
