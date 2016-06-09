var expect = require("chai").expect;
var includeFromFile = require("../../../src/utils/include-from-file");

describe("includeFromFile", function() {
	describe("when no fromFile", function() {
		it("should throw error", function() {
			var fn = function() {
				includeFromFile("/test/fixture/overriding/cluster.yaml");
			};
			expect(fn).to.throw();
		});
	});

	describe("when passing invalid fromFile", function() {
		it("should throw error about invalid fromFile path", function() {
			var fn = function() {
				includeFromFile("/test/fixture/test/simple.yaml", "./test/does-not-exist.yaml");
			};
			expect(fn).to.throw();
		});
	});

	describe("when passing valid fromFile", function() {
		it("should return the contents of the included file in json format", function() {
			var includeFile = includeFromFile("/test/fixture/test/simple.yaml", "./simple.yaml");
			expect(includeFile).to.deep.equal({
				testing: true
			});
		});
	});
});
