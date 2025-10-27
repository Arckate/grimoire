import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { copy } from "./copy";

const mockPlop = {
	getPlopfilePath: vi.fn(),
	getDestBasePath: vi.fn(),
	renderString: vi.fn(),
};

beforeEach(() => {
	vi.resetAllMocks();
});

describe("copy", () => {
	it("copies file when destination does not exist", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = {
			src: "templates/{{name}}.ts",
			dest: "src/{{name}}.ts",
			force: false,
			type: "copy",
		};

		mockPlop.getPlopfilePath.mockReturnValue("/plop");
		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString
			.mockImplementationOnce(() => "templates/Test.ts") // for src
			.mockImplementationOnce(() => "src/Test.ts"); // for dest

		vi.spyOn(fs, "existsSync").mockReturnValue(false);
		const mkdirSync = vi
			.spyOn(fs, "mkdirSync")
			.mockImplementation((() => {}) as any);
		const copyFileSync = vi
			.spyOn(fs, "copyFileSync")
			.mockImplementation(() => {});

		const result = copy(answers, config, mockPlop as any);

		// Assert
		expect(result).toBe(path.join("/project", "src/Test.ts"));
		expect(mkdirSync).toHaveBeenCalledWith(path.join("/project", "src"), {
			recursive: true,
		});
		expect(copyFileSync).toHaveBeenCalledWith(
			path.join("/plop", "templates/Test.ts"),
			path.join("/project", "src/Test.ts"),
		);
	});

	it("throws error when destination exists and force is false", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = {
			src: "templates/{{name}}.ts",
			dest: "src/{{name}}.ts",
			force: false,
			type: "copy",
		};

		mockPlop.getPlopfilePath.mockReturnValue("/plop");
		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString
			.mockImplementationOnce(() => "templates/Test.ts")
			.mockImplementationOnce(() => "src/Test.ts");

		vi.spyOn(fs, "existsSync").mockReturnValue(true);

		try {
			copy(answers, config, mockPlop as any);
			throw new Error("Should have thrown");
		} catch (err: any) {
			// Assert
			expect(err).toEqual({
				type: "copy",
				path: path.join("/project", "src/Test.ts"),
				error: "File already exists",
			});
		}
	});

	it("copies file even if destination exists when force is true", () => {
		// Arrange/Act
		const answers = { name: "Test" };
		const config = {
			src: "templates/{{name}}.ts",
			dest: "src/{{name}}.ts",
			force: true,
			type: "copy",
		};

		mockPlop.getPlopfilePath.mockReturnValue("/plop");
		mockPlop.getDestBasePath.mockReturnValue("/project");
		mockPlop.renderString
			.mockImplementationOnce(() => "templates/Test.ts")
			.mockImplementationOnce(() => "src/Test.ts");

		vi.spyOn(fs, "existsSync").mockReturnValue(true);
		const mkdirSync = vi
			.spyOn(fs, "mkdirSync")
			.mockImplementation((() => {}) as any);
		const copyFileSync = vi
			.spyOn(fs, "copyFileSync")
			.mockImplementation(() => {});

		const result = copy(answers, config, mockPlop as any);

		// Assert
		expect(result).toBe(path.join("/project", "src/Test.ts"));
		expect(mkdirSync).toHaveBeenCalledWith(path.join("/project", "src"), {
			recursive: true,
		});
		expect(copyFileSync).toHaveBeenCalledWith(
			path.join("/plop", "templates/Test.ts"),
			path.join("/project", "src/Test.ts"),
		);
	});
});
