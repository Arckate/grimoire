import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, type Mock, vi } from "vitest";
import { FilePathError } from "~/errors/FilePathError";
import { findPlopPath } from "./findPlopPath";

vi.mock("node:fs");

describe("findPlopPath", () => {
	const namePlopFile = "plopfile.js";
	const dir = "/custom";
	const defaultDir = "/default";

	it("returns path from dir if file exists there", () => {
		// Arrange/Act
		const expectedPath = path.join(dir, namePlopFile);
		(fs.existsSync as Mock).mockImplementation((p) => p === expectedPath);
		const result = findPlopPath({ dir, defaultDir, namePlopFile });

		// Assert
		expect(result).toBe(expectedPath);
	});

	it("returns path from defaultDir if file exists there", () => {
		// Arrange/Act
		const expectedPath = path.join(defaultDir, namePlopFile);
		(fs.existsSync as Mock).mockImplementation((p) => p === expectedPath);

		const result = findPlopPath({ dir, defaultDir, namePlopFile });

		// Assert
		expect(result).toBe(expectedPath);
	});

	it("throws FilePathError if file is not found", () => {
		// Arrange/Act/Assert
		(fs.existsSync as Mock).mockReturnValue(false);

		expect(() => findPlopPath({ dir, defaultDir, namePlopFile })).toThrowError(
			new FilePathError(`The file "${namePlopFile}" does not exist.`),
		);
	});
});
