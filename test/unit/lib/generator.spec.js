"use strict";

const os = require("os");
const expect = require("chai").expect;
const Promise = require("bluebird");
const yamlHandler = require("../../../src/util/yaml-handler");
const Generator = require("../../../src/lib/generator");
const fse = require("fs-extra");
const path = require("path");

describe("Generator", () => {
	describe("create service file", () => {
		it("should create valid service file", (done) => {
			return Promise.coroutine(function* () {
				const clusterDefs = yield yamlHandler.loadClusterDefinitions("./test/fixture");
				const clusterDef = clusterDefs[0];
				const generator = new Generator(clusterDef, {}, "./test/fixture", os.tmpdir(), true);
				expect(clusterDef).to.exist;
				if (!fse.existsSync( path.join(os.tmpdir(), clusterDef.name())) ) {
					fse.mkdirsSync( path.join(os.tmpdir(), clusterDef.name()) );
				}
				// manually merge this here
				clusterDef.configuration().svc = clusterDef.resources().auth.svc;
				yield generator.processService(clusterDef.resources().auth, clusterDef.configuration() );
				const svc = yamlHandler.loadFileSync(path.join(os.tmpdir(), clusterDef.name(), "auth-svc.yaml"));
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
			const imageResources = { auth: { testing: { image: "SOME-TESTING-IMAGE"}, develop: { image: "SOME-DEVELOP-IMAGE"} } };

			return Promise.coroutine(function* () {
				const clusterDefs = yield yamlHandler.loadClusterDefinitions("./test/fixture");
				const clusterDef = clusterDefs[0];
				const generator = new Generator(clusterDef, imageResources, "./test/fixture", os.tmpdir(), true);
				expect(clusterDef).to.exist;
				if (!fse.existsSync( path.join(os.tmpdir(), clusterDef.name())) ) {
					fse.mkdirsSync( path.join(os.tmpdir(), clusterDef.name()) );
				}
				const localConfig = generator._createLocalConfiguration(clusterDef.configuration(), "auth", clusterDef.resources().auth);
				expect(localConfig).to.exist;
				expect(localConfig.svc).to.exist;
				console.log("localConfig: %j", localConfig);
				expect(localConfig).to.not.equal(clusterDef.configuration());
				expect(localConfig.name).to.equal("auth");
				expect(localConfig.image).to.equal("SOME-DEVELOP-IMAGE");
				expect(localConfig.env).to.include({name: "test", value: "testvalue"});
				done();
			})().catch( (err) => {
				done(err);
			});

		});
	});

});
