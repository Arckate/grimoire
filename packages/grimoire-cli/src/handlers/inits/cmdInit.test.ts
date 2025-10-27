import type { Cli } from "@arckate/grimoire-core";
import { CONF_INITS, DEFAULT_INIT } from "@arckate/grimoire-core/const";
import * as cmdModule from "@arckate/grimoire-core/handler";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdInit } from "./cmdInit";

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

describe("cmdInit", () => {
	it("should run runGen with default args and exit 0", async () => {
		// Arrange/Act
		const { exitCode } = await render({
			argv: ["init", "--out", "./output", "--force"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					configKey: CONF_INITS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.runGen).toHaveBeenCalledWith(
			expect.objectContaining({
				args: [DEFAULT_INIT, "json", "camelCase"],
				force: true,
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should call pathConstructor and loadGlobals", async () => {
		// Arrange/Act
		await render({
			argv: ["init"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					configKey: CONF_INITS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(pathModule.pathConstructor).toHaveBeenCalled();
		expect(cmdModule.loadGlobals).toHaveBeenCalled();
	});

	it("should use configFileExt and configFileType from getConfig in args", async () => {
		// Arrange/Act
		const cli = {
			getProcessTerm: () => ({ cwd: () => "/cwd", exit: vi.fn() }),
			getConfig: vi.fn().mockReturnValue({ configFileExt: "ts", configFileType: "kebabCase" }),
			getConfCmd: vi.fn().mockReturnValue({ config: {} }),
			getPrompts: vi.fn().mockReturnValue({ cliLogger: vi.fn(), cliLoggerError: vi.fn() }),
			addGlobals: vi.fn(),
			addDirs: vi.fn(),
		} as unknown as Cli;

		await render({
			argv: ["init"],
			setup: ({ program, processTerm }) => {
				// Override processTerm in cli
				(cli as any).getProcessTerm = () => processTerm;
				cmdInit({
					program,
					name: "init",
					configKey: CONF_INITS,
					cli,
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.runGen).toHaveBeenCalledWith(
			expect.objectContaining({
				args: [DEFAULT_INIT, "ts", "kebabCase"],
			}),
		);
	});

	it("should catch error and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "runGen").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const { exitCode } = await render({
			argv: ["init"],
			setup: ({ program, processTerm }) => {
				cmdInit({
					program,
					name: "init",
					configKey: CONF_INITS,
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
