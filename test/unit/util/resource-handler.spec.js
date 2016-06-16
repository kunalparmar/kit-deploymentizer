"use strict";

const expect = require("chai").expect;
const resourceHandler = require("../../../src/util/resource-handler");

describe("resourceHandler", () => {
  describe("Encoding", () =>  {
    it("should base64 encode string", () => {
      const strToEncode = "Encode Me";
      const encodedStr = resourceHandler.encode(strToEncode, "base64");
      expect(encodedStr).to.not.equal(strToEncode);
      const buf =  new Buffer(encodedStr, "base64");
      expect(buf.toString("utf8")).to.equal(strToEncode);
    });

    it("Should default to utf8", () => {
      const strToEncode = "Encode Me";
      const encodedStr = resourceHandler.encode(strToEncode);
      expect(encodedStr).to.equal(strToEncode);
    });

    it("Should throw error with unsupport encoding type", () => {
      const fn = () => {
        resourceHandler.encode("SomeString", "UTF-32BE");
      };
      expect(fn).to.throw();
    });
  });
});
