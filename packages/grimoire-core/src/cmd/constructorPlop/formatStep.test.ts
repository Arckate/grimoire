import { describe, expect, it } from "vitest";
import { STARTER_TYPES } from "~/const/starters";
import { formatStep } from "./formatStep";

describe("formatStep", () => {
	it("should return CMD_PLOP type when step has generator", () => {
		// Arrange/Act
		const input = { generator: "plop-generator" };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.CMD_PLOP);
		expect(result.step).toEqual(input);
	});

	it('should return FILE_PLOP type when step has "in"', () => {
		// Arrange/Act
		const input = { in: "src/index.ts" };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.FILE_PLOP);
		expect(result.step).toEqual(input);
	});

	it("should return MULTI_CHOICE type when step has question", () => {
		// Arrange/Act
		const input = { question: "Choose one" };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.MULTI_CHOICE);
		expect(result.step).toEqual(input);
	});

	it("should return FILTER type when step has keyFilter", () => {
		// Arrange/Act
		const input = { keyFilter: "filterKey" };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.FILTER);
		expect(result.step).toEqual(input);
	});

	it("should return STARTER type when step has starterName", () => {
		// Arrange/Act
		const input = { starterName: "starter-template" };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.STARTER);
		expect(result.step).toEqual(input);
	});

	it("should return UNKNOWN type when step has no known keys", () => {
		// Arrange/Act
		const input = { foo: "bar" };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.UNKNOWN);
		expect(result.step).toEqual(input);
	});

	it("should return INIT type when step has initGenerator", () => {
		// Arrange/Act
		const input = { initGenerator: "init-script" };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.INIT);
		expect(result.step).toEqual(input);
	});

	it("should return SET_VALUES type when step has keys", () => {
		// Arrange/Act
		const input = { keys: { foo: "bar" }, value: {} };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.SET_VALUES);
		expect(result.step).toEqual(input);
	});

	it("should return INPUT type when step has inputQuestion", () => {
		// Arrange/Act
		const input = { inputQuestion: "What is your name?" };
		const result = formatStep(input);

		// Assert
		expect(result.type).toBe(STARTER_TYPES.INPUT);
		expect(result.step).toEqual(input);
	});
});
