import { describe, expect, it } from "vitest";
import { mergeInitsConfig } from "./mergeInitsConfig";

describe("mergeInitsConfig", () => {
	it("merges all three configs correctly", () => {
		// Arrange/Act
		const result = mergeInitsConfig({
			defaultDirConfig: {
				genA: {
					nameDir: "default",
					initFn: () => ({ description: "default" }),
				},
			},
			dirConfig: {
				genB: { nameDir: "dir", initFn: () => ({ description: "dir" }) },
			},
			rootConfig: {
				genC: { nameDir: "root", initFn: () => ({ description: "root" }) },
			},
		});

		// Assert
		expect(Object.keys(result)).toEqual(["genA", "genB", "genC"]);
	});

	it("merges with missing defaultDirConfig", () => {
		// Arrange/Act
		const result = mergeInitsConfig({
			defaultDirConfig: undefined,
			dirConfig: {
				genB: { nameDir: "dir", initFn: () => ({ description: "dir" }) },
			},
			rootConfig: {
				genC: { nameDir: "root", initFn: () => ({ description: "root" }) },
			},
		});

		// Assert
		expect(Object.keys(result)).toEqual(["genB", "genC"]);
	});

	it("merges with only rootConfig", () => {
		// Arrange/Act
		const result = mergeInitsConfig({
			defaultDirConfig: undefined,
			dirConfig: undefined,
			rootConfig: {
				genC: { nameDir: "root", initFn: () => ({ description: "root" }) },
			},
		});

		// Assert
		expect(Object.keys(result)).toEqual(["genC"]);
	});

	it("resolves key conflicts with later configs overriding earlier ones", () => {
		// Arrange/Act
		const result = mergeInitsConfig({
			defaultDirConfig: {
				genX: {
					nameDir: "default",
					initFn: () => ({ description: "default" }),
				},
			},
			dirConfig: {
				genX: { nameDir: "dir", initFn: () => ({ description: "dir" }) },
			},
			rootConfig: {
				genX: { nameDir: "root", initFn: () => ({ description: "root" }) },
			},
		});

		// Assert
		expect((result.genX as any)?.nameDir).toBe("root"); // ✅ rootConfig overrides dirConfig and defaultDirConfig
	});

	it("merges nested values deeply", () => {
		// Arrange/Act
		const result = mergeInitsConfig({
			defaultDirConfig: {
				genY: {
					nameDir: "default",
					initFn: () => ({
						description: "default",
						actions: [{ type: "add", path: "default.ts" }],
					}),
				},
			},
			dirConfig: {
				genY: {
					initFn: () => ({
						actions: [{ type: "modify", path: "dir.ts" }],
					}),
				} as any,
			},
			rootConfig: {},
		});

		// Assert
		expect((result.genY as any)?.initFn?.({})?.actions).toEqual([
			{ type: "modify", path: "dir.ts" },
		]);
	});

	it("uses empty object when rootConfig is undefined", () => {
		// Arrange/Act
		const result = mergeInitsConfig({
			defaultDirConfig: {
				genA: {
					nameDir: "default",
					initFn: () => ({ description: "default" }),
				},
			},
			dirConfig: {
				genB: { nameDir: "dir", initFn: () => ({ description: "dir" }) },
			},
			rootConfig: undefined,
		});

		// Assert
		expect(result).toEqual({
			genA: expect.any(Object),
			genB: expect.any(Object),
		});
		expect((result.genA as any)?.nameDir).toBe("default");
		expect((result.genB as any)?.nameDir).toBe("dir");
	});
});
