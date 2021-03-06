"use strict";

const os = require("os");
const expect = require("chai").expect;
const Promise = require("bluebird");
const yamlHandler = require("../../../src/util/yaml-handler");
const Generator = require("../../../src/lib/generator");
const fse = require("fs-extra");
const path = require("path");

const configStub = {
	fetch: function() {
		return  Promise.resolve({
				env: [
				{ name: "ENV_ONE",   value: "value-one" },
				{ name: "ENV_TWO",   value: "value-two" },
				{ name: "ENV_THREE", value: "value-three" },
				{ name: "ENV_FOUR",  value: "value-four" } ]
		});
	}
}

describe("Generator", () => {
	describe("with empty cluster", () => {
		it("should not fail", (done) => {
			return Promise.coroutine(function* () {
				const clusterDefs = yield yamlHandler.loadClusterDefinitions("./test/fixture/empty-clusters");
				const clusterDef = clusterDefs[0];
				const generator = new Generator(clusterDef, {}, "", os.tmpdir(), true, configStub);
				expect(clusterDef).to.exist;
				yield generator.process();
				done();
			})().catch( (err) => {
				done(err);
			});
		});
	});

	describe("with valid cluster", () => {
		it("should create valid service file", (done) => {
			return Promise.coroutine(function* () {
				const clusterDefs = yield yamlHandler.loadClusterDefinitions("./test/fixture/clusters");
				const clusterDef = clusterDefs[1];
				const generator = new Generator(clusterDef, {}, "./test/fixture/resources", os.tmpdir(), true, configStub);
				expect(clusterDef).to.exist;
				if (!fse.existsSync( path.join(os.tmpdir(), clusterDef.name())) ) {
					fse.mkdirsSync( path.join(os.tmpdir(), clusterDef.name()) );
				}
				// manually merge this here
				clusterDef.configuration().svc = clusterDef.resources().auth.svc;
				yield generator.processService(clusterDef.resources().auth, clusterDef.configuration() );
				const svc = yield yamlHandler.loadFile(path.join(os.tmpdir(), clusterDef.name(), "auth-svc.yaml"));
				expect(svc.metadata.name).to.equal("auth-svc");
				expect(svc.metadata.labels.app).to.equal("invisionapp");
				done();
			})().catch( (err) => {
				done(err);
			});
		});
	});

	describe("Local configuration", () => {
		it("should create copy of config, merging in values from resource", (done) => {
			const imageResources = { "node-auth": { testing: { image: "SOME-TESTING-IMAGE"}, develop: { image: "SOME-DEVELOP-IMAGE"} } };

			return Promise.coroutine(function* () {
				const clusterDefs = yield yamlHandler.loadClusterDefinitions("./test/fixture/clusters");
				const clusterDef = clusterDefs[2];
				const generator = new Generator(clusterDef, imageResources, "./test/fixture/resources", os.tmpdir(), true, configStub);
				expect(clusterDef).to.exist;
				if (!fse.existsSync( path.join(os.tmpdir(), clusterDef.name())) ) {
					fse.mkdirsSync( path.join(os.tmpdir(), clusterDef.name()) );
				}
				// we add the image tag here, since we dont preload the base cluster def in this test
				clusterDef.resources().auth.containers["auth-con"].image_tag = "node-auth";
				const localConfig = yield generator._createLocalConfiguration(clusterDef.configuration(), "auth", clusterDef.resources().auth);
				expect(localConfig).to.exist;
				expect(localConfig.svc).to.exist;
				expect(localConfig).to.not.equal(clusterDef.configuration());
				expect(localConfig.name).to.equal("auth");
				expect(localConfig["auth-con"].image).to.equal("SOME-DEVELOP-IMAGE");
				expect(localConfig["auth-con"].env).to.include({ name: "test", value: "testvalue" });
				expect(localConfig["auth-con"].env).to.include({ name: "ENV_ONE",   value: "value-one" });
				expect(localConfig["auth-con"].env).to.include({ name: "ENV_THREE", value: "value-three" });
				done();
			})().catch( (err) => {
				done(err);
			});

		});

		it("should create copy of config, without plugin", (done) => {
			const imageResources = { "node-auth": { testing: { image: "SOME-TESTING-IMAGE"}, develop: { image: "SOME-DEVELOP-IMAGE"} } };

			return Promise.coroutine(function* () {
				const clusterDefs = yield yamlHandler.loadClusterDefinitions("./test/fixture/clusters");
				const clusterDef = clusterDefs[2];
				const generator = new Generator(clusterDef, imageResources, "./test/fixture/resources", os.tmpdir(), true, undefined);
				expect(clusterDef).to.exist;
				if (!fse.existsSync( path.join(os.tmpdir(), clusterDef.name())) ) {
					fse.mkdirsSync( path.join(os.tmpdir(), clusterDef.name()) );
				}
				// we add the image tag here, since we dont preload the base cluster def in this test
				clusterDef.resources().auth.containers["auth-con"].image_tag = "node-auth";
				const localConfig = yield generator._createLocalConfiguration(clusterDef.configuration(), "auth", clusterDef.resources().auth);
				expect(localConfig).to.exist;
				expect(localConfig.svc).to.exist;
				expect(localConfig).to.not.equal(clusterDef.configuration());
				expect(localConfig["auth-con"].name).to.equal("auth");
				expect(localConfig["auth-con"].image).to.equal("SOME-DEVELOP-IMAGE");
				expect(localConfig["auth-con"].env).to.include({ name: "test", value: "testvalue" });
				expect(localConfig["auth-con"].env).to.not.include({ name: "ENV_ONE",   value: "value-one" });
				done();
			})().catch( (err) => {
				done(err);
			});

		});
	});

});
