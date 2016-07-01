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

		it("should load plugin successfully", (done) => {
      const options = { api_url: "http://somehost/v1", api_token: "SOME-TOKEN"}
			const ApiConfig = require("../../../src/plugin/env-api-client");
      const apiConfig = new ApiConfig(options);
      expect(apiConfig).to.exist;
      expect(apiConfig.api_token).to.equal("SOME-TOKEN");
      expect(apiConfig.api_url).to.equal("http://somehost/v1");
			done();
		});
	});

});
