import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { formatError } from "~/utils/formatError";
import { logError } from "~/utils/logger";
import { pathValidating } from "./pathValidating";

vi.mock("node:fs/promises");
vi.mock("~/utils/formatError");
vi.mock("~/utils/logger");

beforeEach(() => {
	vi.resetAllMocks();
});

describe("pathValidating", () => {
	const processTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};

	it("returns valid path info when path exists", async () => {
		// Arrange/Act
		const mockStats = {
			isFile: vi.fn().mockReturnValue(true),
			isDirectory: vi.fn().mockReturnValue(false),
		};

		(fs.stat as unknown as Mock).mockResolvedValue(mockStats);

		const result = await pathValidating(processTerm, "/some/path");

		// Assert
		expect(fs.stat).toHaveBeenCalledWith("/some/path");
		expect(result).toEqual({
			isValidPath: true,
			isDirectory: false,
			isFile: true,
		});
	});

	it("returns invalid path info when stat throws", async () => {
		// Arrange/Act
		const fakeError = new Error("ENOENT");
		(fs.stat as unknown as Mock).mockRejectedValue(fakeError);
		(formatError as Mock).mockReturnValue("Formatted error");

		const result = await pathValidating(processTerm, "/invalid/path");

		// Assert
		expect(formatError).toHaveBeenCalledWith(fakeError);
		expect(logError).toHaveBeenCalledWith(
			expect.objectContaining({ error: "Formatted error" }),
		);
		expect(result).toEqual({
			isValidPath: false,
			isDirectory: false,
			isFile: false,
		});
	});
});
