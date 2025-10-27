import { beforeEach, describe, expect, it } from "vitest";
import type { InitFn } from "../entities/Inits";
import { clearInits, getInits, setInits } from "./inits";

describe("inits state module with InitFn and InitFindDir", () => {
	const mockInitFn: InitFn = ({
		findDir,
		config: { configFile, cliFolder },
	}) => ({
		description: "Mock generator",
		actions: [
			{
				type: "add",
				path: findDir?.("index.ts") || "",
				templateFile: `${cliFolder}/${configFile}`,
			},
		],
	});

	beforeEach(() => {
		clearInits();
	});

	it("sets and retrieves a simple InitFn", () => {
		// Arrange/Act
		setInits({
			simple: mockInitFn,
		});

		const result = getInits();

		// Assert
		expect(result.simple).toBe(mockInitFn);
	});

	it("sets and retrieves a named InitFn object", () => {
		// Arrange/Act
		setInits({
			named: {
				nameDir: "components",
				initFn: mockInitFn,
			},
		});

		const result = getInits();

		// Arrange
		expect((result.named as any)?.nameDir).toBe("components");
		expect(typeof (result.named as any)?.initFn).toBe("function");
	});

	it("returns a shallow copy from getInits", () => {
		// Arrange/Act
		setInits({ test: mockInitFn });
		const result = getInits();

		// Assert
		expect(result).not.toBe(getInits()); // ensure it's a copy
	});

	it("clears inits", () => {
		// Arrange
		setInits({ test: mockInitFn });

		// Act
		clearInits();

		// Assert
		expect(getInits()).toEqual({});
	});
});
