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

    it("should load configuration object, covnerted into the correct format", (done) => {
      Promise.coroutine(function* () {
        const handler = new PluginHandler("../../../src/plugin/file-config");
        expect(handler).to.exist;
        const config = yield handler.fetch( "service", "environment", "example" )
        console.log(` Configuration: ${JSON.stringify(config)}`);
        expect(config).to.exist;
        expect(config).to.include({name: "ENV_ONE", value: "value one"})
        expect(config).to.include({name: "ENV_TWO", value: "value two"})
        expect(config).to.include({name: "ENV_THREE", value: "value three"})
        done();
      })().catch( (err) => {
        done(err);
      });
    });

    it("should fail with file not found", (done) => {
      Promise.coroutine(function* () {
        const handler = new PluginHandler("../../../src/plugin/file-config");
        expect(handler).to.exist;
        const config = yield handler.fetch( "service", "environment", "not-here" )
        done(new Error("Should have failed"));
      })().catch( (err) => {
        done();
      });
    });

  });

});
