var expect = require("chai").expect;
var mergeArrayNames = require("../../../src/utils/merge-array-names").default;
var reverseMergeArrayNames = require("../../../src/utils/merge-array-names").reverse;

describe("mergeArrayNames", function() {
	describe("when merging object with no arrays", function() {
		it("should do nothing", function() {
			expect(mergeArrayNames({
				id: "123",
				age: 21,
				name: "joe"
			}, {
				id: "123",
				name: "chesley"
			})).to.be.undefined;
		});
	});

	describe("when merging object with arrays not containing objects", function() {
		it("should do nothing", function() {
			expect(mergeArrayNames({
				id: "123",
				age: 21,
				name: "joe",
				siblings: [
					"alex",
					"emma"
				]
			}, {
				id: "123",
				name: "chesley",
				siblings: [
					"alex",
					"emma",
					"steve"
				]
			})).to.be.undefined;
		});
	});

	describe("when merging arrays containing objects", function() {
		it("should do nothing", function() {
			expect(mergeArrayNames([
				{
					firstname: "alex"
				},
				{
					firstname: "emma"
				}
			], [
				{
					firstname: "alex"
				},
				{
					firstname: "emma"
				},
				{
					firstname: "steve"
				}
			])).to.be.undefined;
		});
	});


	describe("when merging arrays containing objects that have the `name` property", function() {
		var first, second, result;
		beforeEach(function() {
			first = [
				{
					name: "alex",
					age: 20
				},
				{
					name: "emma",
					age: 19,
					weight: 60
				}
			];
			second = [
				{
					name: "alex",
					height: 160
				},
				{
					name: "emma",
					age: 20,
					height: 165
				},
				{
					name: "steve",
					height: 150
				}
			];
			result = [
				{
					name: "alex",
					age: 20,
					height: 160
				},
				{
					name: "emma",
					age: 20,
					weight: 60,
					height: 165
				},
				{
					name: "steve",
					height: 150
				}
			];
		});

		describe("and using default", function() {
			it("should merge based on name property", function() {
				expect(mergeArrayNames(first, second)).to.deep.equal(result);
			});
		});
		describe("and using reverse", function() {
			it("should merge based on name property", function() {
				expect(reverseMergeArrayNames(second, first)).to.deep.equal(result);
			});
		});
	});

	describe("when merging arrays containing objects where some have the `name` property", function() {
		var first, second, result;

		beforeEach(function() {
			first = [
				{
					name: "alex",
					age: 20
				},
				{
					age: 19,
					weight: 60
				}
			];
			second = [
				{
					name: "alex",
					height: 160
				},
				{
					age: 20,
					height: 165
				},
				{
					name: "steve",
					height: 150
				}
			];
			result = [
				{
					name: "alex",
					age: 20,
					height: 160
				},
				{
					age: 19,
					weight: 60
				},
				{
					age: 20,
					height: 165
				},
				{
					name: "steve",
					height: 150
				}
			];
		});

		describe("and using default", function() {
			it("should merge based on name property and append the rests", function() {
				expect(mergeArrayNames(first, second)).to.deep.equal(result);
			});
		});
		describe("and using reverse", function() {
			it("should merge based on name property and append the rests", function() {
				expect(reverseMergeArrayNames(second, first)).to.deep.equal(result);
			});
		});
	});
});
