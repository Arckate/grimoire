import type { Cli } from "@arckate/grimoire-core";
import { CONF_GENERATORS } from "@arckate/grimoire-core/const";
import * as cmdModule from "@arckate/grimoire-core/handler";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdGen } from "./cmdGen";

const makeCli = (processTerm: any): Cli =>
	({
		getProcessTerm: () => processTerm,
		getConfig: vi.fn().mockReturnValue({ configFileExt: "json", configFileType: "camelCase" }),
		getConfCmd: vi.fn().mockReturnValue({ config: {} }),
		getPrompts: vi.fn().mockReturnValue({ cliLogger: vi.fn(), cliLoggerError: vi.fn() }),
		addGlobals: vi.fn(),
		addDirs: vi.fn(),
	}) as unknown as Cli;

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(cmdModule, "findGenerators").mockResolvedValue([
		{ name: "cli" },
	] as any);

	vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("mocked/output");

	vi.spyOn(cmdModule, "runGen").mockResolvedValue(true);

	vi.spyOn(cmdModule, "loadGlobals").mockResolvedValue(undefined);

	vi.spyOn(utilsModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdGen", () => {
	it("should run runGen and exit 0", async () => {
		// Arrange/Act
		const renderPromise = render({
			argv: [
				"gen",
				"cli",
				"--out",
				"./output",
				"--force",
				"--type-gen",
				"basic",
			],
			setup: ({ program, processTerm }) => {
				cmdGen({
					program,
					name: "gen",
					configKey: CONF_GENERATORS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		const { exitCode } = await renderPromise;

		// Assert
		expect(cmdModule.runGen).toHaveBeenCalledWith(
			expect.objectContaining({
				force: true,
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should call findGenerators and pathConstructor", async () => {
		// Arrange/Act
		await render({
			argv: ["gen", "cli"],
			setup: ({ program, processTerm }) => {
				cmdGen({
					program,
					name: "gen",
					configKey: CONF_GENERATORS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.findGenerators).toHaveBeenCalledWith(
			expect.objectContaining({
				config: expect.anything(),
			}),
		);
		expect(pathModule.pathConstructor).toHaveBeenCalled();
	});

	it("should catch error and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "runGen").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["gen", "bad"],
			setup: ({ program, processTerm }) => {
				cmdGen({
					program,
					name: "gen",
					configKey: CONF_GENERATORS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		const { exitCode } = await renderPromise;

		// Assert
		expect(utilsModule.formatError).toHaveBeenCalledWith(expect.any(Error));
		expect(exitCode).toBe(1);
	});
});
