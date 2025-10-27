import { beforeEach, describe, expect, it } from "vitest";
import type { ExtractFindDir, ExtractFn, Extracts } from "~/entities/Extracts";
import { clearExtracts, getExtracts, setExtracts } from "./extracts";

describe("extracts store", () => {
	beforeEach(() => {
		clearExtracts();
	});

	const mockFindDirFactory: (nameDir: string) => ExtractFindDir =
		(nameDir) => (extraPath) =>
			`/base/${nameDir ?? "default"}${extraPath ? `/${extraPath}` : ""}`;

	const extractFn: ExtractFn = (_findDir) => ({
		description: "Mock extract",
		path: mockFindDirFactory("extract"),
	});

	it("sets and gets a valid ExtractFn", () => {
		// Arrange
		const config: Partial<Extracts> = {
			extractA: extractFn,
		};

		// Act
		setExtracts(config);

		const result = getExtracts();

		// Assert
		expect(result).toEqual(config);
	});

	it("returns a copy, not a reference", () => {
		// Arrange
		const config: Partial<Extracts> = {
			extractA: extractFn,
		};

		setExtracts(config);

		// Act
		const result = getExtracts();
		result.extractA = null as any;

		// Assert
		expect(getExtracts().extractA).toBe(extractFn);
	});

	it("clears extracts", () => {
		// Arrange
		setExtracts({
			extractA: extractFn,
		});

		// Act
		clearExtracts();

		// Assert
		expect(getExtracts()).toEqual({});
	});
});
