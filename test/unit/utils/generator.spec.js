var expect = require("chai").expect;
var generator = require("../../../src/utils/generator");

describe("Generator", function() {
	describe("when no cluster files found", function() {
		it("should generate spec with merged ENV data", function() {
			var fn = function() {
				generator("/test/fixture/does-not-exist/clusters/*.yaml");
			};
			expect(fn).to.throw();
		});
	});

	describe("when parsing simple cluster", function() {
		var clusters;

		before(function() {
			clusters = generator("/test/fixture/simple/clusters/*.yaml");
		});

		it("should generate the correct number of clusters", function() {
			expect(clusters).to.have.length(1);
		});
		it("should generate correct number of specs", function() {
			expect(clusters[0].spec).to.have.length(4);
		});
		it("should include specs from file", function() {
			expect(clusters[0].spec[0].metadata.name).to.equal("app1-svc");
			expect(clusters[0].spec[1].metadata.name).to.equal("app2-svc");
			expect(clusters[0].spec[2].metadata.name).to.equal("app1-deployment");
			expect(clusters[0].spec[3].metadata.name).to.equal("app2-deployment");
		});
		it("should generate spec with merged ENV data", function() {
			expect(clusters[0].spec[2].spec.template.spec.containers[0].env).to.contain({
				name: "DEBUG",
				value: "1"
			});
			expect(clusters[0].spec[2].spec.template.spec.containers[0].env).to.contain({
				name: "DOMAIN",
				value: "google.com"
			});
			expect(clusters[0].spec[2].spec.template.spec.containers[0].env).to.contain({
				name: "SECRET",
				value: "secret123"
			});
			expect(clusters[0].spec[3].spec.template.spec.containers[0].env).to.contain({
				name: "DEBUG",
				value: "0"
			});
			expect(clusters[0].spec[3].spec.template.spec.containers[0].env).to.contain({
				name: "DOMAIN",
				value: "google.com"
			});
			expect(clusters[0].spec[3].spec.template.spec.containers[0].env).to.contain({
				name: "SECRET",
				value: "secret123"
			});
		});
	});

	describe("when parsing override cluster", function() {
		var clusters;

		before(function() {
			clusters = generator("/test/fixture/overriding/*-cluster.yaml");
		});

		it("should generate the correct number of clusters", function() {
			expect(clusters).to.have.length(1);
		});
		it("should override replicate", function() {
			expect(clusters[0].spec[0].spec.replicas).to.equal(1);
		});
		it("should still have base properties", function() {
			expect(clusters[0].spec[0].spec.selector.name).to.equal("app1-pod");
		});
		it("should still only have one container spec", function() {
			expect(clusters[0].spec[0].spec.template.spec.containers).to.have.length(1);
		});
		it("should still have base container properties", function() {
			expect(clusters[0].spec[0].spec.template.spec.containers[0].image).to.equal("node:5.5.0-slim");
		});
		it("should have correct number of env properties", function() {
			expect(clusters[0].spec[0].spec.template.spec.containers[0].env).to.have.length(2);
		});
		it("should add container env properties", function() {
			expect(clusters[0].spec[0].spec.template.spec.containers[0].env).to.contain({
				name: "LOGGING",
				value: "1"
			});
		});
		it("should still have base container env properties", function() {
			expect(clusters[0].spec[0].spec.template.spec.containers[0].env).to.contain({
				name: "DEBUG",
				value: "0"
			});
		});
	});
});
