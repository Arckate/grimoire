import { beforeEach, describe, expect, it } from "vitest";
import type { FindDir, Generators, GeneratorsFn } from "~/entities/Generators";
import { clearGenerators, getGenerators, setGenerators } from "./generators";

describe("generators store", () => {
	beforeEach(() => {
		clearGenerators();
	});

	const mockFindDirFactory: (name?: string) => FindDir =
		(nameDir) => (extraPath) =>
			`/base/${nameDir || "default"}${extraPath ? `/${extraPath}` : ""}`;

	const generatorsFn: GeneratorsFn = () => ({
		description: "Mock generator",
		path: mockFindDirFactory("mock"),
	});

	it("sets and gets a simple GeneratorsFn", () => {
		// Arrange
		const config: Partial<Generators> = {
			mock: generatorsFn,
		};

		setGenerators(config);

		// Act
		const result = getGenerators();

		// Assert
		expect(result).toEqual(config);
	});

	it("sets and gets a wrapped generator object", () => {
		// Arrange
		const config: Partial<Generators> = {
			wrapped: {
				generatorsFn,
				nameDir: "wrapped-dir",
			},
		};

		setGenerators(config);

		// Act
		const result = getGenerators();

		// Assert
		expect(result).toEqual(config);
	});

	it("returns a copy, not a reference", () => {
		// Arrange
		const config: Partial<Generators> = {
			mock: generatorsFn,
		};

		setGenerators(config);

		// Act
		const result = getGenerators();
		result.mock = null as any;

		// Assert
		expect(getGenerators().mock).toBe(generatorsFn);
	});

	it("clears generators", () => {
		// Arrange
		setGenerators({
			mock: generatorsFn,
		});

		// Arrange
		clearGenerators();

		// Assert
		expect(getGenerators()).toEqual({});
	});
});
