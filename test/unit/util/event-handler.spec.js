"use strict";

var expect = require("chai").expect;
const Promise = require("bluebird");


describe("EventHandler", () =>  {

  // Skip these, other tests log to events causing these to fail when run as a group
	describe.skip("Load", () =>  {

		it("Should load the handler", () => {
      const eventHandler = require("../../../src/util/event-handler");
			expect(eventHandler).to.exist;
		});

		it("should fire events", (done) => {
      const TEST_MSG = "Test my message";
      const eventHandler = require("../../../src/util/event-handler");
      expect(eventHandler.INFO).to.exist;
      expect(eventHandler.WARN).to.exist;
      expect(eventHandler.FATAL).to.exist;
      eventHandler.on(eventHandler.INFO, function(message) {
      	expect(message).to.equal(TEST_MSG);
        done();
      });
      eventHandler.emitInfo(TEST_MSG);
		});

		it("should fire any event", (done) => {
      const TEST_MSG = "Test my message 2";
      const eventHandler = require("../../../src/util/event-handler");
      eventHandler.on("myEvent", function(message) {
      	expect(message).to.equal(TEST_MSG);
        done();
      });
      eventHandler.emit("myEvent", TEST_MSG);
		});

	});

});
