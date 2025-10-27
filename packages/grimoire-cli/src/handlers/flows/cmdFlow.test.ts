import type { Cli } from "@arckate/grimoire-core";
import { CONF_FLOWS } from "@arckate/grimoire-core/const";
import * as cmdModule from "@arckate/grimoire-core/handler";
import * as pathModule from "@arckate/grimoire-core/path";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdFlow } from "./cmdFlow";

const makeCli = (processTerm: any): Cli => {
	const cliLoggerError = vi.fn();
	const cliLogger = vi.fn();
	return {
		getProcessTerm: () => processTerm,
		getConfig: vi.fn().mockReturnValue({ configFileExt: "json", configFileType: "camelCase" }),
		getConfCmd: vi.fn().mockReturnValue({ config: {} }),
		getPrompts: vi.fn().mockReturnValue({ cliLogger, cliLoggerError }),
		addGlobals: vi.fn(),
		addDirs: vi.fn(),
	} as unknown as Cli;
};

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("mocked/output");

	vi.spyOn(cmdModule, "runFlow").mockResolvedValue(undefined);
});

describe("cmdFlow", () => {
	it("should run runFlow and exit 0", async () => {
		// Arrange/Act
		const { exitCode } = await render({
			argv: ["flow", "cli", "--out", "./output", "--force"],
			setup: ({ program, processTerm }) => {
				cmdFlow({
					program,
					name: "flow",
					configKey: CONF_FLOWS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.runFlow).toHaveBeenCalledWith(
			expect.objectContaining({
				force: true,
				dest: "mocked/output",
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should pass configKey to getConfCmd via runFlow", async () => {
		// Arrange/Act
		await render({
			argv: ["flow", "cli"],
			setup: ({ program, processTerm }) => {
				cmdFlow({
					program,
					name: "flow",
					configKey: CONF_FLOWS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.runFlow).toHaveBeenCalledWith(
			expect.objectContaining({
				flowsConfig: expect.anything(),
			}),
		);
	});

	it("should catch error, log it via prompts, and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "runFlow").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const cliLogger = vi.fn();
		const cliLoggerError = vi.fn().mockReturnValue("Formatted error");

		const { exitCode } = await render({
			argv: ["flow", "bad"],
			setup: ({ program, processTerm }) => {
				const cli = {
					getProcessTerm: () => processTerm,
					getConfig: vi.fn().mockReturnValue({ configFileExt: "json", configFileType: "camelCase" }),
					getConfCmd: vi.fn().mockReturnValue({ config: {} }),
					getPrompts: vi.fn().mockReturnValue({ cliLogger, cliLoggerError }),
					addGlobals: vi.fn(),
					addDirs: vi.fn(),
				} as unknown as Cli;

				cmdFlow({
					program,
					name: "flow",
					configKey: CONF_FLOWS,
					cli,
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cliLogger).toHaveBeenCalledWith(
			expect.objectContaining({ args: [""] }),
		);
		expect(exitCode).toBe(1);
	});
});
