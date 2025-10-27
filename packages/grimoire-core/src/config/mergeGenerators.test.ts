import { describe, expect, it } from "vitest";
import type { Generators, SubGenerators } from "~/models";
import { mergeGenerators } from "./mergeGenerators";

const makeGen = (...names: string[]): Generators =>
	Object.fromEntries(
		names.map((n) => [n, () => ({})]),
	) as unknown as Generators;

const makeSubGen = (groups: Record<string, Generators>): SubGenerators =>
	({ subGenConf: true, ...groups }) as unknown as SubGenerators;

describe("mergeGenerators", () => {
	it("merges two plain Generators directly", () => {
		const result = mergeGenerators(makeGen("alpha"), makeGen("beta"));

		expect(result).not.toHaveProperty("subGenConf");
		expect(result).toHaveProperty("alpha");
		expect(result).toHaveProperty("beta");
	});

	it("wraps old Generators under 'default' when new is SubGenerators", () => {
		const old = makeGen("alpha");
		const next = makeSubGen({ react: makeGen("component") });

		const result = mergeGenerators(old, next) as SubGenerators;

		expect(result.subGenConf).toBe(true);
		expect((result as any).default).toHaveProperty("alpha");
		expect(result).toHaveProperty("react");
	});

	it("wraps new Generators under 'default' when old is SubGenerators", () => {
		const old = makeSubGen({ react: makeGen("component") });
		const next = makeGen("beta");

		const result = mergeGenerators(old, next) as SubGenerators;

		expect(result.subGenConf).toBe(true);
		expect(result).toHaveProperty("react");
		expect((result as any).default).toHaveProperty("beta");
	});

	it("merges two SubGenerators directly", () => {
		const old = makeSubGen({ react: makeGen("component") });
		const next = makeSubGen({ vue: makeGen("page") });

		const result = mergeGenerators(old, next) as SubGenerators;

		expect(result.subGenConf).toBe(true);
		expect(result).toHaveProperty("react");
		expect(result).toHaveProperty("vue");
	});
});
