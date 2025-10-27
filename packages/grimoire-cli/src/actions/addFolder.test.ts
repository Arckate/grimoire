import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addFolder } from "./addFolder";

const mockPlop = {
	getDestBasePath: vi.fn(),
	renderString: vi.fn(),
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe("addFolder", () => {
	it("creates folder when it does not exist", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = { dest: "src/{{name}}", force: false, type: "add" };

		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString.mockReturnValue("src/Test");

		const mkdirSync = vi
			.spyOn(fs, "mkdirSync")
			.mockImplementation((() => {}) as any);
		vi.spyOn(fs, "existsSync").mockReturnValue(false);

		const result = addFolder(answers, config, mockPlop as any);

		// Assert
		expect(result).toBe(path.join("/project", "src/Test"));
		expect(mkdirSync).toHaveBeenCalledWith(path.join("/project", "src/Test"), {
			recursive: true,
		});
	});

	it("throws error when folder exists and force is false", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = { dest: "src/{{name}}", force: false, type: "add" };

		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString.mockReturnValue("src/Test");

		vi.spyOn(fs, "existsSync").mockReturnValue(true);

		try {
			addFolder(answers, config, mockPlop as any);
			throw new Error("Should have thrown");
		} catch (err: any) {
			// Assert
			expect(err).toEqual({
				type: "add",
				path: path.join("/project", "src/Test"),
				error: "Folder already exists",
			});
		}
	});

	it("creates folder even if it exists when force is true", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = { dest: "src/{{name}}", force: true, type: "add" };

		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString.mockReturnValue("src/Test");

		const mkdirSync = vi
			.spyOn(fs, "mkdirSync")
			.mockImplementation((() => {}) as any);
		vi.spyOn(fs, "existsSync").mockReturnValue(true);

		const result = addFolder(answers, config, mockPlop as any);

		// Assert
		expect(result).toBe(path.join("/project", "src/Test"));
		expect(mkdirSync).toHaveBeenCalledWith(path.join("/project", "src/Test"), {
			recursive: true,
		});
	});
});
