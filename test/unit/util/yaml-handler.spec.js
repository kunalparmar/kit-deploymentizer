"use strict";

const os = require("os");
const path = require("path");
const expect = require("chai").expect;
const yamlHandler = require("../../../src/util/yaml-handler");

describe("YamlLoading", () => {
  describe("File not found", () =>  {
    it("should not find file", (done) => {
      yamlHandler.loadFile("./test/fixture/doNotExistclusters")
        .then( (file) => {
          done(new Error("Should have thrown error"));
        }).catch( (err) => {
          done();
        });
    });
  });

  describe("invalid yaml syntax", () => {
    it("should throw error about invalid syntax", (done) => {
      yamlHandler.loadFile("./test/fixture/util/invalid.yaml")
        .then( (file) => {
          done(new Error("Should have thrown error"));
        }).catch( (err) => {
          done();
        });
    });
  });

  describe("when passing valid file", () => {
    it("should return the contents of the included file in json format", (done) => {
      yamlHandler.loadFile("./test/fixture/util/sample.yaml")
        .then( (clusterNamespace) => {
          expect(clusterNamespace.kind).to.equal("ClusterNamespace");
          done();
        }).catch( (err) => {
          done(err);
        });
    });
  });
});

describe("YamlSaving", () => {
  describe("Save simple JSON object", () => {
    it("should be successful", (done) => {
      const content = `
      kind: ClusterNamespace
      metadata:
        name: example-1
        branch: master
      resources:
        auth:
          branch: develop
      `;
      yamlHandler.saveResourceFile(os.tmpdir(), "example-1", content )
        .then( () => {
          return yamlHandler.loadFile(path.join(os.tmpdir(), "example-1.yaml"));
        }).then( (loadedFile) => {
          expect(loadedFile).to.exist;
          expect(loadedFile.resources.auth).to.exist;
          expect(loadedFile.resources.auth.branch).to.equal( "develop");
          done();
        }).catch( (err) => {
          done(err);
        });
    });
  });
});

describe("Image Tag Loading", () => {
  describe("Loading images", () => {
    it("should be successful", () => {
      const imageResources = yamlHandler.loadImageDefinitions("./test/fixture/images");
      expect(imageResources).to.exist;
      expect(imageResources["node-auth"]).to.exist;
      expect(imageResources["node-auth"].develop).to.exist;
      expect(imageResources["node-auth"].master).to.exist;
      expect(imageResources["node-auth"].release).to.exist;
      expect(imageResources["node-activity"].develop.image).to.exist;
    });
  });
});
