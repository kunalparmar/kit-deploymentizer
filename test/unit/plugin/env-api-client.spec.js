"use strict";

var expect = require("chai").expect;
const Promise = require("bluebird");

describe("ENV API Client Configuration plugin", () =>  {

	describe("Load Client", () =>  {
		it("should fail with validation error", (done) => {
			try {
  			const ApiConfig = require("../../../src/plugin/env-api-client");
        const apiConfig = new ApiConfig();
				done(new Error("Should have failed"));
			} catch(err) {
				done();
			};
		});

		it("should fail with validation error", (done) => {
			try {
      const options = { api: "http://somehost/v1", Token: "SOME-TOKEN"}
			const ApiConfig = require("../../../src/plugin/env-api-client");
      const apiConfig = new ApiConfig(options);
				done(new Error("Should have failed"));
			} catch(err) {
				done();
			};
		});

		it("should load plugin successfully", (done) => {
      const options = { apiUrl: "http://somehost/v1", apiToken: "SOME-TOKEN", timeout: 20000}
			const ApiConfig = require("../../../src/plugin/env-api-client");
      const apiConfig = new ApiConfig(options);
      expect(apiConfig).to.exist;
      expect(apiConfig.apiToken).to.equal("SOME-TOKEN");
      expect(apiConfig.apiUrl).to.equal("http://somehost/v1");
      expect(apiConfig.timeout).to.equal(20000);
			done();
		});
	});

});
