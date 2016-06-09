var expect = require("chai").expect;
var exec = require("child_process").exec;

describe("Deploymentizer", function() {
	describe("when parsing simple cluster", function() {
		it("should parse files", function(done) {
			exec("./src/deploymentizer --clean=true --pattern=/test/fixture/simple/clusters/*-cluster.yaml --output=/tmp/generated", function(error, stdout, stderr) {
				expect(error).to.be.null;
				expect(stderr).to.be.empty;
				expect(stdout).not.to.be.empty;
				done();
			});
		});
	});

	describe("when getting help", function() {
		it("should return help information", function(done) {
			exec("./src/deploymentizer --help", function(error, stdout, stderr) {
				expect(error).to.be.null;
				expect(stderr).to.be.empty;
				expect(stdout).not.to.be.empty;
				done();
			});
		});
	});
});
