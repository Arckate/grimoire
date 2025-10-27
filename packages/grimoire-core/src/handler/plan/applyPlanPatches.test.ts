import { describe, expect, it } from "vitest";
import type { Plan } from "~/models";
import { applyPlanPatches } from "./applyPlanPatches";

const basePlan: Plan = {
	genName: "my-generator",
	genId: "123",
	genMeta: {},
};

describe("applyPlanPatches", () => {
	it("returns plan unchanged when selector does not match", () => {
		const result = applyPlanPatches(basePlan, {
			"no-match.patch": {
				selector: { genName: "other-generator" },
				value: { genId: "999" },
			},
		});

		expect(result).toEqual(basePlan);
	});

	it("applies patch value when selector matches", () => {
		const result = applyPlanPatches(basePlan, {
			"match.patch": {
				selector: { genName: "my-generator" },
				value: { genId: "456" },
			},
		});

		expect(result.genId).toBe("456");
		expect(result.genName).toBe("my-generator");
	});

	it("does not mutate the original plan", () => {
		const plan: Plan = { ...basePlan };

		applyPlanPatches(plan, {
			"m.patch": {
				selector: { genName: "my-generator" },
				value: { genId: "new" },
			},
		});

		expect(plan.genId).toBe("123");
	});

	it("applies multiple patches sequentially", () => {
		const result = applyPlanPatches(basePlan, {
			"first.patch": {
				selector: { genName: "my-generator" },
				value: { genId: "step1" },
			},
			"second.patch": {
				selector: { genId: "step1" },
				value: { genId: "step2" },
			},
		});

		expect(result.genId).toBe("step2");
	});

	it("replaces array with empty array when patch value has empty array", () => {
		const plan: Plan = { ...basePlan, tags: ["a", "b"] };

		const result = applyPlanPatches(plan, {
			"m.patch": {
				selector: { genName: "my-generator" },
				value: { tags: [] },
			},
		});

		expect(result.tags).toEqual([]);
	});

	it("concatenates arrays when patch value has non-empty array", () => {
		const plan: Plan = { ...basePlan, tags: ["a"] };

		const result = applyPlanPatches(plan, {
			"m.patch": {
				selector: { genName: "my-generator" },
				value: { tags: ["b"] },
			},
		});

		expect(result.tags).toEqual(["a", "b"]);
	});

	it("replaces non-array target with src array when patch array is non-empty", () => {
		const plan: Plan = { ...basePlan, tags: "original" };

		const result = applyPlanPatches(plan, {
			"m.patch": {
				selector: { genName: "my-generator" },
				value: { tags: ["appended"] },
			},
		});

		expect(result.tags).toEqual(["appended"]);
	});

	describe("deepPartialMatch — selector branches", () => {
		it("matches when selector has nested object field", () => {
			const plan: Plan = { ...basePlan, meta: { env: "prod" } };

			const result = applyPlanPatches(plan, {
				"m.patch": {
					selector: { meta: { env: "prod" } },
					value: { genId: "patched" },
				},
			});

			expect(result.genId).toBe("patched");
		});

		it("does not match when nested object field differs", () => {
			const plan: Plan = { ...basePlan, meta: { env: "dev" } };

			const result = applyPlanPatches(plan, {
				"m.patch": {
					selector: { meta: { env: "prod" } },
					value: { genId: "patched" },
				},
			});

			expect(result.genId).toBe("123");
		});

		it("does not match when selector target is null for object partial", () => {
			const plan: Plan = { ...basePlan, meta: null };

			const result = applyPlanPatches(plan, {
				"m.patch": {
					selector: { meta: { env: "prod" } },
					value: { genId: "patched" },
				},
			});

			expect(result.genId).toBe("123");
		});

		it("matches when selector array contains primitive included in target array", () => {
			const plan: Plan = { ...basePlan, tags: ["a", "b", "c"] };

			const result = applyPlanPatches(plan, {
				"m.patch": {
					selector: { tags: ["a"] },
					value: { genId: "patched" },
				},
			});

			expect(result.genId).toBe("patched");
		});

		it("does not match when selector array is array but target is not", () => {
			const plan: Plan = { ...basePlan, tags: "not-an-array" };

			const result = applyPlanPatches(plan, {
				"m.patch": {
					selector: { tags: ["a"] },
					value: { genId: "patched" },
				},
			});

			expect(result.genId).toBe("123");
		});

		it("matches when selector array contains object matched in target array", () => {
			const plan: Plan = {
				...basePlan,
				items: [
					{ name: "foo", val: 1 },
					{ name: "bar", val: 2 },
				],
			};

			const result = applyPlanPatches(plan, {
				"m.patch": {
					selector: { items: [{ name: "foo" }] },
					value: { genId: "patched" },
				},
			});

			expect(result.genId).toBe("patched");
		});
	});
});
