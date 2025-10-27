import fs from "node:fs";
import { describe, expect, it, type Mock, vi } from "vitest";
import { copyTo } from "./copyTo";
import { normalizePath } from "./utils/normalizePath";

// Mock fs methods
vi.mock("node:fs", async () => {
	return {
		default: {
			existsSync: vi.fn(() => false),
			mkdirSync: vi.fn(),
		},
	};
});

describe("copyTo", () => {
	const mockRead = vi.fn(() => "content");
	const mockWrite = vi.fn();

	const mockPlop = {
		getPlopfilePath: vi.fn(() => "/plopfile"),
		getDestBasePath: vi.fn(() => "/dest"),
		renderString: vi.fn((template: string) => template),
		getDefaultInclude: vi.fn(() => ({
			findFile: {
				js: {
					component: {
						read: mockRead,
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
		src: "src/component.js",
		typeFileFrom: "component",
		extFileTo: "ts",
		typeFileTo: "component",
		nameFileTo: "component",
		type: "copy",
		force: true,
	};

	it("should copy file when read/write handlers exist", () => {
		// Arrange/Act
		const result = copyTo({}, config, mockPlop as any);

		// Assert
		expect(result).toBe(normalizePath("/dest/component.ts"));
		expect(mockRead).toHaveBeenCalledWith(
			normalizePath("/plopfile/src/component.js"),
		);
		expect(mockWrite).toHaveBeenCalledWith(
			normalizePath("/dest/component.ts"),
			"content",
		);
	});

	it("should throw if file already exists and force is false", () => {
		// Arrange/Act
		config.force = false;
		(fs.existsSync as Mock).mockReturnValue(true);

		try {
			copyTo({}, config, mockPlop as any);
			throw new Error("Expected error was not thrown");
		} catch (err: any) {
			// Assert
			expect(err).toMatchObject({
				type: "copy",
				path: normalizePath("/dest/component.ts"),
				error: "File already exists",
			});
		}
	});

	it("should throw if read/write handlers are missing", () => {
		// Arrange/Act
		(fs.existsSync as Mock).mockReturnValue(false);
		mockPlop.getDefaultInclude = vi.fn(() => ({
			findFile: {},
		}));

		try {
			copyTo({}, config, mockPlop as any);
			throw new Error("Expected error was not thrown");
		} catch (err: any) {
			// Assert
			expect(err).toMatchObject({
				type: "copy",
				path: normalizePath("/dest/component.ts"),
				error: "findFile or one value in findFile doesn't exists",
			});
		}
	});
});
