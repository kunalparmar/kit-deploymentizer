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

	describe("External ENV", () =>  {
		before(() => {
			process.env.EXTERNAL_ENV = "external";
			process.env.EXTERNAL_ENCODED_ENV = "encodeme";
		});
		it("should find and add external ENV defined", () => {
			let envs = [
				{name: "EXTERNAL_ENCODED_ENV", external: true, encoding: "base64"},
				{name: "EXTERNAL_ENV", external: true},
				{name: "INTERNAL_ENV", value: "myvalue"}
			];

			let newEnvs = resourceHandler.loadExternalEnv(envs);
			expect(newEnvs).to.exist;
			expect(newEnvs).to.include({name: "EXTERNAL_ENV", value: "external", external: true});
			expect(newEnvs).to.include({name: "INTERNAL_ENV", value: "myvalue"});

			const buf =  new Buffer("encodeme", "utf8");
			let encodedValue = buf.toString("base64");
			expect(newEnvs).to.include({name: "EXTERNAL_ENCODED_ENV", value: encodedValue, external: true, encoding: "base64"});
		});
		after(() => {
			delete process.env.EXTERNAL_ENV;
			delete process.env.EXTERNAL_ENCODED_ENV;
		});
	});
});
