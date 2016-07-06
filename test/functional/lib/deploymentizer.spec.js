"use strict";

const expect = require("chai").expect;
const os = require("os");
const path = require("path");
const fse = require("fs-extra");
const Deploymentizer = require("../../../src/lib/deploymentizer");
const yamlHandler = require("../../../src/util/yaml-handler");
const resourceHandler = require("../../../src/util/resource-handler");
const Promise = require("bluebird");

describe("Deploymentizer", () => {
	describe("generate files", () => {
		it("should run successfully", (done) => {

      Promise.coroutine(function* () {
        process.env.SECRET_USERNAME = "myusername";
        process.env.SECRET_PASSWORD = "mypassword";
        process.env.GITHUB_TOKEN = "s@mpler@ndomt0ken";
        fse.mkdirsSync(path.join(os.tmpdir(), "generated"));
        const deployer = new Deploymentizer ({
            clean: true,
            save: true,
            conf: "/test/fixture/kit.yaml"
          });
        expect(deployer).to.exist;
        // generate the files from our test fixtures
        yield deployer.process();
        // load them back in and validate values
			  const authSvc = yield yamlHandler.loadFile(path.join(os.tmpdir(), "generated", "test-fixture", "auth-svc.yaml"));
        expect(authSvc).to.exist;
        expect(authSvc.metadata.name).to.equal("auth-svc");
        expect(authSvc.metadata.labels.app).to.exist;
        expect(authSvc.metadata.labels.app).to.equal("invisionapp");

			  const auth = yield yamlHandler.loadFile(path.join(os.tmpdir(), "generated", "test-fixture", "auth-deployment.yaml"));
        expect(auth).to.exist;
        expect(auth.metadata.name).to.equal("auth-deployment");
        expect(auth.spec.template.spec.imagePullSecrets).to.include({"name": "docker-quay-secret"});
        expect(auth.spec.replicas).to.equal(2);
        expect(auth.spec.strategy).to.exist;
        expect(auth.spec.strategy.type).to.equal("RollingUpdate");
        expect(auth.spec.strategy.rollingUpdate.maxUnavailable).to.equal(1);
        expect(auth.spec.strategy.rollingUpdate.maxSurge).to.equal(1);
        expect(auth.spec.selector.matchLabels.name).to.equal("auth-pod");
        expect(auth.spec.template.spec.containers[0]).to.exist;
        expect(auth.spec.template.spec.containers[0].name).to.equal("auth-con");
        expect(auth.spec.template.spec.containers[0].imagePullPolicy).to.equal("IfNotPresent");
        expect(auth.spec.template.spec.containers[0].image).to.exist;
        expect(auth.spec.template.spec.containers[0].image).to.contain("master");
        expect(auth.spec.template.spec.containers[0].livenessProbe).to.exist;
        expect(auth.spec.template.spec.containers[0].livenessProbe.initialDelaySeconds).to.equal(30);
        expect(auth.spec.template.spec.containers[0].livenessProbe.timeoutSeconds).to.equal(3);
        expect(auth.spec.template.spec.containers[0].env.length).to.equal(4);
        expect(auth.spec.template.spec.containers[0].env).to.include({"name": "ENV_TWO", "value": "value two"});
        expect(auth.spec.template.spec.containers[0].env).to.include({"name": "test", "value": "testvalue"});

        // This is "disabled" and should not be generated
        expect(fse.existsSync(path.join(os.tmpdir(), "generated", "test-fixture", "activity-deployment.yaml"))).to.equal(false);

			  const secret = yield yamlHandler.loadFile(path.join(os.tmpdir(), "generated", "test-fixture", "example-secret.yaml"));
        expect(secret).to.exist;
        expect(secret.data.GITHUB_TOKEN).to.equal("s@mpler@ndomt0ken");
        expect(secret.data.SECRET_USERNAME).to.equal(resourceHandler.encode("myusername", "base64"));
        expect(secret.data.SECRET_PASSWORD).to.equal(resourceHandler.encode("mypassword", "base64"));
        done();
      })().catch( (err) => {
        done(err);
      });
    });
	});
});
