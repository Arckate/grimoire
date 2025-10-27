import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import * as readConfigCliFileModule from "~/utils/readConfigCliFile";
import { findAllGenFile } from "./findAllGenFile";

vi.mock("node:fs/promises");

beforeEach(() => {
	vi.resetAllMocks();
});

describe("findAllGenFile", () => {
	it("returns only .gen.json files", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		const mockAllDirs = [
			{ name: "data.gen.json", isDirectory: () => false },
			{ name: "other.json", isDirectory: () => false },
			{ name: "folder", isDirectory: () => true },
			{ name: "config.gen.json", isDirectory: () => false },
		];

		(fs.readdir as Mock).mockResolvedValue(mockAllDirs);

		const result = await findAllGenFile("/some/path");

		// Assert
		expect(result).toEqual(["data.gen.json", "config.gen.json"]);
	});

	it("returns empty array when no .gen.json files are found", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		const mockAllDirs = [
			{ name: "data.json", isDirectory: () => false },
			{ name: "folder", isDirectory: () => true },
			{ name: "notes.txt", isDirectory: () => false },
		];

		(fs.readdir as Mock).mockResolvedValue(mockAllDirs);

		const result = await findAllGenFile("/some/path");

		// Assert
		expect(result).toEqual([]);
	});

	it("returns empty array when directory is empty", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		(fs.readdir as Mock).mockResolvedValue([]);

		const result = await findAllGenFile("/empty");

		// Assert
		expect(result).toEqual([]);
	});
});
