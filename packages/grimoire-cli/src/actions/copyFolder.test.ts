import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { copyFolder } from "./copyFolder";

const mockPlop = {
	getPlopfilePath: vi.fn(),
	getDestBasePath: vi.fn(),
	renderString: vi.fn(),
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe("copyFolder", () => {
	it("copies folder when destination does not exist", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = {
			src: "templates/{{name}}",
			dest: "src/{{name}}",
			force: false,
			type: "copyFolder",
		};

		mockPlop.getPlopfilePath.mockReturnValue("/plop");
		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString
			.mockImplementationOnce(() => "templates/Test") // src
			.mockImplementationOnce(() => "src/Test"); // dest

		vi.spyOn(fs, "existsSync").mockReturnValue(false);
		const mkdirSync = vi
			.spyOn(fs, "mkdirSync")
			.mockImplementation((() => {}) as any);
		const cpSync = vi.spyOn(fs, "cpSync").mockImplementation(() => {});

		const result = copyFolder(answers, config, mockPlop as any);

		// Assert
		expect(result).toBe(path.join("/project", "src/Test"));
		expect(mkdirSync).toHaveBeenCalledWith(path.join("/project", "src/Test"), {
			recursive: true,
		});
		expect(cpSync).toHaveBeenCalledWith(
			path.join("/plop", "templates/Test"),
			path.join("/project", "src/Test"),
			{ recursive: true },
		);
	});

	it("throws error when destination exists and force is false", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = {
			src: "templates/{{name}}",
			dest: "src/{{name}}",
			force: false,
			type: "copyFolder",
		};

		mockPlop.getPlopfilePath.mockReturnValue("/plop");
		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString
			.mockImplementationOnce(() => "templates/Test")
			.mockImplementationOnce(() => "src/Test");

		vi.spyOn(fs, "existsSync").mockReturnValue(true);

		try {
			copyFolder(answers, config, mockPlop as any);
			throw new Error("Should have thrown");
		} catch (err: any) {
			// Assert
			expect(err).toEqual({
				type: "copyFolder",
				path: path.join("/project", "src/Test"),
				error: "Folder already exists",
			});
		}
	});

	it("copies folder even if destination exists when force is true", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = {
			src: "templates/{{name}}",
			dest: "src/{{name}}",
			force: true,
			type: "copyFolder",
		};

		mockPlop.getPlopfilePath.mockReturnValue("/plop");
		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString
			.mockImplementationOnce(() => "templates/Test")
			.mockImplementationOnce(() => "src/Test");

		vi.spyOn(fs, "existsSync").mockReturnValue(true);
		const mkdirSync = vi
			.spyOn(fs, "mkdirSync")
			.mockImplementation((() => {}) as any);
		const cpSync = vi.spyOn(fs, "cpSync").mockImplementation(() => {});

		const result = copyFolder(answers, config, mockPlop as any);

		// Assert
		expect(result).toBe(path.join("/project", "src/Test"));
		expect(mkdirSync).toHaveBeenCalledWith(path.join("/project", "src/Test"), {
			recursive: true,
		});
		expect(cpSync).toHaveBeenCalledWith(
			path.join("/plop", "templates/Test"),
			path.join("/project", "src/Test"),
			{ recursive: true },
		);
	});
});
