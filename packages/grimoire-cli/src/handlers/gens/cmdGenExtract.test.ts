import type { Cli } from "@arckate/grimoire-core";
import { CONF_EXTRACTS } from "@arckate/grimoire-core/const";
import * as cmdModule from "@arckate/grimoire-core/handler";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdGenExtract } from "./cmdGenExtract";

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

	vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("mocked/output");

	vi.spyOn(cmdModule, "runGen").mockResolvedValue(true);

	vi.spyOn(cmdModule, "loadGlobals").mockResolvedValue(undefined);

	vi.spyOn(utilsModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdGenExtract", () => {
	it("should run runGen and exit 0", async () => {
		// Arrange/Act
		const { exitCode } = await render({
			argv: ["extract", "user", "--out", "./output", "--force"],
			setup: ({ program, processTerm }) => {
				cmdGenExtract({
					program,
					name: "extract",
					configKey: CONF_EXTRACTS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.runGen).toHaveBeenCalledWith(
			expect.objectContaining({
				args: expect.arrayContaining(["user"]),
				force: true,
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should call pathConstructor and loadGlobals", async () => {
		// Arrange/Act
		await render({
			argv: ["extract", "user"],
			setup: ({ program, processTerm }) => {
				cmdGenExtract({
					program,
					name: "extract",
					configKey: CONF_EXTRACTS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(pathModule.pathConstructor).toHaveBeenCalled();
		expect(cmdModule.loadGlobals).toHaveBeenCalled();
	});

	it("should call addGlobals with inPath when --in option is provided", async () => {
		// Arrange/Act
		const addGlobals = vi.fn();
		const cli = {
			getConfig: vi.fn().mockReturnValue({}),
			getConfCmd: vi.fn().mockReturnValue({ config: {} }),
			getPrompts: vi.fn().mockReturnValue({ cliLogger: vi.fn(), cliLoggerError: vi.fn() }),
			addGlobals,
			addDirs: vi.fn(),
		} as unknown as Cli;

		await render({
			argv: ["extract", "user", "--in", "./src/component"],
			setup: ({ program, processTerm }) => {
				(cli as any).getProcessTerm = () => processTerm;
				cmdGenExtract({
					program,
					name: "extract",
					configKey: CONF_EXTRACTS,
					cli,
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(addGlobals).toHaveBeenCalledWith(
			expect.objectContaining({ inPath: "./src/component" }),
		);
	});

	it("should fallback to CONF_EXTRACTS when configKey is empty", async () => {
		// Arrange/Act
		const getConfCmd = vi.fn().mockReturnValue({ config: {} });
		const cli = {
			getConfig: vi.fn().mockReturnValue({}),
			getConfCmd,
			getPrompts: vi.fn().mockReturnValue({ cliLogger: vi.fn(), cliLoggerError: vi.fn() }),
			addGlobals: vi.fn(),
			addDirs: vi.fn(),
		} as unknown as Cli;

		await render({
			argv: ["extract", "user"],
			setup: ({ program, processTerm }) => {
				(cli as any).getProcessTerm = () => processTerm;
				cmdGenExtract({
					program,
					name: "extract",
					configKey: "",
					cli,
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(getConfCmd).toHaveBeenCalledWith(CONF_EXTRACTS);
	});

	it("should catch error and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "runGen").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const { exitCode } = await render({
			argv: ["extract", "fail"],
			setup: ({ program, processTerm }) => {
				cmdGenExtract({
					program,
					name: "extract",
					configKey: CONF_EXTRACTS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(utilsModule.formatError).toHaveBeenCalledWith(expect.any(Error));
		expect(exitCode).toBe(1);
	});
});
