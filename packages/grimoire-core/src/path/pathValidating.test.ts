import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { loggerErrorPrompt } from "~/prompts";
import { formatError } from "~/utils";
import { pathValidating } from "./pathValidating";

vi.mock("node:fs/promises");
vi.mock("~/utils/formatError");
vi.mock("~/prompts/loggerPrompt", () => ({ loggerPrompt: vi.fn(), loggerErrorPrompt: vi.fn() }));

beforeEach(() => {
	vi.resetAllMocks();
});

describe("pathValidating", () => {
	const processTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
		cwd: process.cwd,
	};
	const cli = {
		getProcessTerm: () => processTerm,
		getPrompts: () => ({ cliLoggerError: loggerErrorPrompt }),
	} as any;

	it("returns valid path info when path exists", async () => {
		// Arrange/Act
		const mockStats = {
			isFile: vi.fn().mockReturnValue(true),
			isDirectory: vi.fn().mockReturnValue(false),
		};

		(fs.stat as unknown as Mock).mockResolvedValue(mockStats);

		const result = await pathValidating(cli, "/some/path");

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

		const result = await pathValidating(cli, "/invalid/path");

		// Assert
		expect(formatError).toHaveBeenCalledWith(fakeError);
		expect(loggerErrorPrompt).toHaveBeenCalledWith(
			expect.objectContaining({ config: expect.objectContaining({ error: "Formatted error" }) }),
		);
		expect(result).toEqual({
			isValidPath: false,
			isDirectory: false,
			isFile: false,
		});
	});
});
