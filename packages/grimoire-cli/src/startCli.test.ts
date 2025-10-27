import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";

vi.mock("~/.cli/config", () => ({
	default: {
		cliFolder: "cli-folder",
		someOption: true,
	},
}));

const mockStartCli = vi.fn();

vi.mock("@arckate/grimoire-core", async () => {
	return {
		startCliFactory: (...params: any) => {
			mockStartCli(...params);
			return vi.fn();
		},
	};
});

describe("startCli", () => {
	it("should call startCliFactory with correct path and config", async () => {
		const { default: startCli } = await import("./startCli");
		startCli({} as any, "");
		const expectedPath = path.join(
			path.dirname(fileURLToPath(import.meta.url)),
			"../cli-folder",
		);

		expect(mockStartCli).toHaveBeenCalledWith(
			expectedPath,
			expect.objectContaining({ cliFolder: "cli-folder" }),
		);
	});
});
