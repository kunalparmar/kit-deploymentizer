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

});
