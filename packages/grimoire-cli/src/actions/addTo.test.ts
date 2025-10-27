import fs from "node:fs";
import { describe, expect, it, type Mock, vi } from "vitest";
import { addTo } from "./addTo";
import { normalizePath } from "./utils/normalizePath";

// Mock fs methods
vi.mock("node:fs", async () => {
	return {
		default: {
			existsSync: vi.fn(() => false),
			readFileSync: vi.fn(() => "TEMPLATE {{name}}"),
		},
	};
});

describe("addTo", () => {
	const mockStringTo = vi.fn((str: string) => `PROCESSED(${str})`);
	const mockWrite = vi.fn();

	const mockPlop = {
		getPlopfilePath: vi.fn(() => "/plopfile"),
		getDestBasePath: vi.fn(() => "/dest"),
		renderString: vi.fn((template: string) => template),
		getDefaultInclude: vi.fn(() => ({
			findFile: {
				js: {
					component: {
						stringTo: mockStringTo,
					},
				},
				ts: {
					component: {
						write: mockWrite,
					},
				},
			},
		})),
	};

	const config = {
		templateFile: "templates/component.js",
		path: "components/component.ts",
		typeFileFrom: "component",
		typeFileTo: "component",
		type: "add",
		force: true,
	};

	it("should transform and write file when handlers exist", () => {
		// Arrange
		const result = addTo({}, config, mockPlop as any);

		// Act
		const expectedSrc = normalizePath("/plopfile/templates/component.js");
		const expectedDest = normalizePath("/dest/components/component.ts");

		// Assert
		expect(fs.readFileSync).toHaveBeenCalledWith(expectedSrc, "utf-8");
		expect(mockStringTo).toHaveBeenCalledWith("TEMPLATE {{name}}");
		expect(mockWrite).toHaveBeenCalledWith(
			expectedDest,
			"PROCESSED(TEMPLATE {{name}})",
		);
		expect(result).toBe(expectedDest);
	});

	it("should throw if file already exists and force is false", () => {
		// Arrange/Act
		config.force = false;
		(fs.existsSync as Mock).mockReturnValue(true);

		try {
			addTo({}, config, mockPlop as any);
			throw new Error("Expected error was not thrown");
		} catch (err: any) {
			// Assert
			expect(err).toMatchObject({
				type: "add",
				path: normalizePath("/dest/components/component.ts"),
				error: "File already exists",
			});
		}
	});

	it("should throw if stringTo or write handlers are missing", () => {
		// Arrange/Act
		(fs.existsSync as Mock).mockReturnValue(false);
		mockPlop.getDefaultInclude = vi.fn(() => ({
			findFile: {},
		}));

		try {
			addTo({}, config, mockPlop as any);
			throw new Error("Expected error was not thrown");
		} catch (err: any) {
			// Assert
			expect(err).toMatchObject({
				type: "add",
				path: normalizePath("/dest/components/component.ts"),
				error: "findFile or one value in findFile doesn't exists",
			});
		}
	});

	it("should call renderString with empty string if template is falsy", () => {
		// Arrange/Act
		(fs.existsSync as Mock).mockReturnValue(false);
		(fs.readFileSync as Mock).mockReturnValue(null);
		mockPlop.getDefaultInclude = vi.fn(() => ({
			findFile: {},
		}));

		try {
			addTo({}, config, mockPlop as any);
			throw new Error("Expected error was not thrown");
		} catch (err: any) {
			// Assert
			expect(err).toMatchObject({
				type: "add",
				path: normalizePath("/dest/components/component.ts"),
				error: "findFile or one value in findFile doesn't exists",
			});
		}
	});
});
