var expect = require("chai").expect;

describe("KitDeploymentizer", function() {
	describe("when required", function() {
		var KitDeploymentizer;
		beforeEach(function() {
			KitDeploymentizer = require("../../src/index");
		});
		it("should have Deployer class", function() {
			expect(KitDeploymentizer.Deploymentizer).to.be.equal(require("../../src/lib/deploymentizer"));
		});
	});
});
