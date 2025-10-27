import type { Cli } from "@arckate/grimoire-core";
import { CONF_INITS } from "@arckate/grimoire-core/const";
import * as cmdModule from "@arckate/grimoire-core/handler";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdGenInit } from "./cmdGenInit";

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

describe("cmdGenInit", () => {
	it("should run runGen with provided args and exit 0", async () => {
		// Arrange/Act
		const { exitCode } = await render({
			argv: ["init", "setup", "--out", "./output", "--force"],
			setup: ({ program, processTerm }) => {
				cmdGenInit({
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
				args: expect.arrayContaining(["setup"]),
				force: true,
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should call pathConstructor and loadGlobals", async () => {
		// Arrange/Act
		await render({
			argv: ["init", "setup"],
			setup: ({ program, processTerm }) => {
				cmdGenInit({
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

	it("should fallback to CONF_INITS when configKey is empty", async () => {
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
			argv: ["init", "setup"],
			setup: ({ program, processTerm }) => {
				(cli as any).getProcessTerm = () => processTerm;
				cmdGenInit({
					program,
					name: "init",
					configKey: "",
					cli,
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(getConfCmd).toHaveBeenCalledWith(CONF_INITS);
	});

	it("should catch error and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "runGen").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const { exitCode } = await render({
			argv: ["init", "fail"],
			setup: ({ program, processTerm }) => {
				cmdGenInit({
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
