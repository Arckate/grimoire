import { describe, expect, it } from "vitest";
import { PLAN_KEYS } from "~/const";
import type { Plan } from "~/models";
import { separateArgsAndPlan } from "./separateArgsAndPlan";

const basePlan = {
	genName: "my-generator",
	genId: "123",
	genMeta: { author: "charles" },
};

describe("separateArgsAndPlan", () => {
	it("should exclude PLAN_ID and PLAN_META", () => {
		// Arrange/Act
		const input: Plan = {
			...basePlan,
			[PLAN_KEYS.PLAN_ID]: "id",
			[PLAN_KEYS.PLAN_META]: { info: "meta" },
			foo: "bar",
		};

		const result = separateArgsAndPlan(input, false, false);

		// Assert
		expect(result.genName).toBe("my-generator");
		expect(result.args).toHaveProperty("foo");
		expect(result.args).not.toHaveProperty(PLAN_KEYS.PLAN_ID);
		expect(result.args).not.toHaveProperty(PLAN_KEYS.PLAN_META);
	});

	it("should assign genDest if not ignored", () => {
		// Arrange/Act
		const input: Plan = {
			...basePlan,
			[PLAN_KEYS.PLAN_DEST]: "./output",
		};

		const result = separateArgsAndPlan(input, false, false);

		// Assert
		expect(result.genDest).toBe("./output");
	});

	it("should ignore genDest if ignoreDest is true", () => {
		// Arrange/Act
		const input: Plan = {
			...basePlan,
			[PLAN_KEYS.PLAN_DEST]: "./output",
		};

		const result = separateArgsAndPlan(input, false, true);

		// Assert
		expect(result.genDest).toBe("");
	});

	it("should push genLink if deep is true", () => {
		// Arrange/Act
		const input: Plan = {
			...basePlan,
			[PLAN_KEYS.PLAN_LINK]: "linked-generator",
		};

		const result = separateArgsAndPlan(input, true, false);

		// Assert
		expect(result.argsList).toContain("linked-generator");
	});

	it("should sanitize and push single Plan", () => {
		// Arrange/Act
		const nested: Plan = {
			genName: "nested",
			genId: "456",
			genMeta: {},
		};

		const input: Plan = {
			...basePlan,
			nested,
		};

		const result = separateArgsAndPlan(input, false, false);

		// Assert
		expect(result.argsList).toContain(nested);
	});

	it("should sanitize and push array of Plans", () => {
		// Arrange/Act
		const nestedArray: Plan[] = [
			{ genName: "nested1", genId: "1", genMeta: {} },
			{ genName: "nested2", genId: "2", genMeta: {} },
		];

		const input: Plan = {
			...basePlan,
			nestedArray,
		};

		const result = separateArgsAndPlan(input, false, false);

		// Assert
		expect(result.argsList).toEqual(expect.arrayContaining(nestedArray));
	});

	it("should assign planName when PLAN_NAME is present", () => {
		const input: Plan = {
			...basePlan,
			[PLAN_KEYS.PLAN_NAME]: "my-plan",
		};

		const result = separateArgsAndPlan(input, false, false);

		expect(result.planName).toBe("my-plan");
		expect(result.args).not.toHaveProperty(PLAN_KEYS.PLAN_NAME);
	});

	it("should treat non-plan values as regular args", () => {
		// Arrange/Act
		const input: Plan = {
			...basePlan,
			foo: "bar",
			count: 42,
		};

		const result = separateArgsAndPlan(input, false, false);

		// Assert
		expect(result.args.foo).toBe("bar");
		expect(result.args.count).toBe(42);
	});
});
