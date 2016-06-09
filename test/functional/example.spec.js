var expect = require("chai").expect;
var exec = require("child_process").exec;

describe("Example", function() {
	describe("when parsing example cluster", function() {
		it("should parse files", function(done) {
			exec("./src/deploymentizer --pattern /example/*-cluster.yaml", function(error, stdout, stderr) {
				expect(error).to.be.null;
				expect(stderr).to.be.empty;
				expect(stdout).not.to.be.empty;
				done();
			});
		});
	});
});
