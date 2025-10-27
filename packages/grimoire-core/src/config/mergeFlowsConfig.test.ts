import { describe, expect, it, vi } from "vitest";
import type { FlowsConfig } from "~/models";
import { mergeFlowsConfig } from "./mergeFlowsConfig";

const makeConfig = (
	workflows: Record<string, any>,
	constructors: Record<string, any> = {},
): FlowsConfig => ({ workflows, constructors }) as unknown as FlowsConfig;

describe("mergeFlowsConfig", () => {
	it("merges constructors from both configs", () => {
		const old = makeConfig({}, { ctorA: { constrFn: vi.fn() } });
		const next = makeConfig({}, { ctorB: { constrFn: vi.fn() } });

		const result = mergeFlowsConfig(old, next);

		expect(result.constructors).toHaveProperty("ctorA");
		expect(result.constructors).toHaveProperty("ctorB");
	});

	it("adds new workflow when it does not exist in old", () => {
		const old = makeConfig({});
		const next = makeConfig({ myFlow: { step1: { ctorKey: "ctor" } } });

		const result = mergeFlowsConfig(old, next);

		expect(result.workflows.myFlow).toEqual({ step1: { ctorKey: "ctor" } });
	});

	it("preserves old workflows not overridden by new", () => {
		const old = makeConfig({
			flowA: { step1: { ctorKey: "ctorA" } },
			flowB: { step1: { ctorKey: "ctorB" } },
		});
		const next = makeConfig({ flowA: { step2: { ctorKey: "ctorC" } } });

		const result = mergeFlowsConfig(old, next);

		expect(result.workflows).toHaveProperty("flowB");
		expect(result.workflows.flowA).toHaveProperty("step1");
		expect(result.workflows.flowA).toHaveProperty("step2");
	});

	it("does not mutate oldValue.workflows", () => {
		const oldWorkflows = { myFlow: { step1: { ctorKey: "ctorA" } } };
		const old = makeConfig(oldWorkflows);
		const next = makeConfig({ myFlow: { step2: { ctorKey: "ctorB" } } });

		mergeFlowsConfig(old, next);

		expect(oldWorkflows.myFlow).not.toHaveProperty("step2");
	});

	describe("mergeWorkflow — same ctorKey", () => {
		it("deep merges params when both steps have the same ctorKey", () => {
			const old = makeConfig({
				myFlow: { step1: { ctorKey: "ctorA", params: { x: 1 } } },
			});
			const next = makeConfig({
				myFlow: { step1: { ctorKey: "ctorA", params: { y: 2 } } },
			});

			const result = mergeFlowsConfig(old, next);
			const step1 = (result.workflows.myFlow as any).step1;

			expect(step1.ctorKey).toBe("ctorA");
			expect(step1.params).toEqual({ x: 1, y: 2 });
		});

		it("handles null params in old step (hasCtorKey null branch)", () => {
			const old = makeConfig({
				myFlow: { step1: { ctorKey: "ctorA", params: null } },
			});
			const next = makeConfig({
				myFlow: { step1: { ctorKey: "ctorA", params: { x: 1 } } },
			});

			const result = mergeFlowsConfig(old, next);

			expect((result.workflows.myFlow as any).step1.params).toEqual({ x: 1 });
		});
	});

	describe("mergeWorkflow — different ctorKey", () => {
		it("replaces old step with new step when ctorKeys differ", () => {
			const old = makeConfig({
				myFlow: { step1: { ctorKey: "ctorA", params: { old: true } } },
			});
			const next = makeConfig({
				myFlow: { step1: { ctorKey: "ctorB" } },
			});

			const result = mergeFlowsConfig(old, next);
			const step1 = (result.workflows.myFlow as any).step1;

			expect(step1.ctorKey).toBe("ctorB");
			expect(step1).not.toHaveProperty("params");
		});
	});

	describe("mergeWorkflow — hasCtorKey edge cases", () => {
		it("uses default merge when a step has no ctorKey property", () => {
			const old = makeConfig({
				myFlow: { step1: { someKey: "a" } },
			});
			const next = makeConfig({
				myFlow: { step1: { otherKey: "b" } },
			});

			const result = mergeFlowsConfig(old, next);
			const step1 = (result.workflows.myFlow as any).step1;

			expect(step1.someKey).toBe("a");
			expect(step1.otherKey).toBe("b");
		});

		it("uses default merge when ctorKey is not a string", () => {
			const old = makeConfig({
				myFlow: { step1: { ctorKey: 42 } },
			});
			const next = makeConfig({
				myFlow: { step1: { ctorKey: "ctorA" } },
			});

			const result = mergeFlowsConfig(old, next);

			expect((result.workflows.myFlow as any).step1.ctorKey).toBe("ctorA");
		});
	});
});
