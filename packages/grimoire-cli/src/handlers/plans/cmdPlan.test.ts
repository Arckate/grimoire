import type { Cli } from "@arckate/grimoire-core";
import { CONF_GENERATORS } from "@arckate/grimoire-core/const";
import * as cmdModule from "@arckate/grimoire-core/handler";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdPlan } from "./cmdPlan";

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

	vi.spyOn(pathModule, "findParentConfig").mockReturnValue({
		parent: true,
	} as any);

	vi.spyOn(cmdModule, "findPlanFileArgs").mockResolvedValue([
		["arg1", "arg2"],
	] as any);

	vi.spyOn(cmdModule, "runDeepPlan").mockResolvedValue(undefined);

	vi.spyOn(cmdModule, "runGen").mockResolvedValue(true);

	vi.spyOn(cmdModule, "loadPatches").mockResolvedValue(null as any);

	vi.spyOn(utilsModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdPlan", () => {
	it("should run runDeepPlan and exit 0", async () => {
		// Arrange/Act
		const { exitCode } = await render({
			argv: [
				"plan",
				"--in",
				"./gen.json",
				"--out",
				"./output",
				"--force",
				"--deep",
				"--ignore-dest",
				"--type-gen",
				"basic",
			],
			setup: ({ program, processTerm }) => {
				cmdPlan({
					program,
					name: "plan",
					configKey: CONF_GENERATORS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.runDeepPlan).toHaveBeenCalledWith(
			expect.objectContaining({
				force: true,
				deep: true,
				ignoreDest: true,
				typeGen: "basic",
				dest: "mocked/output",
				parentConfig: { parent: true },
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should call findPlanFileArgs with inPath and parentConfig", async () => {
		// Arrange/Act
		await render({
			argv: ["plan", "--in", "./gen.json"],
			setup: ({ program, processTerm }) => {
				cmdPlan({
					program,
					name: "plan",
					configKey: CONF_GENERATORS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.findPlanFileArgs).toHaveBeenCalledWith(
			expect.objectContaining({
				inPath: "./gen.json",
				parentConfig: { parent: true },
			}),
		);
	});

	it("should fallback to CONF_GENERATORS when configKey is empty", async () => {
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
			argv: ["plan"],
			setup: ({ program, processTerm }) => {
				(cli as any).getProcessTerm = () => processTerm;
				cmdPlan({
					program,
					name: "plan",
					configKey: "",
					cli,
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(getConfCmd).toHaveBeenCalledWith(CONF_GENERATORS);
	});

	it("should not call loadPatches when --patch is not provided", async () => {
		// Arrange/Act
		await render({
			argv: ["plan"],
			setup: ({ program, processTerm }) => {
				cmdPlan({
					program,
					name: "plan",
					configKey: CONF_GENERATORS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.loadPatches).not.toHaveBeenCalled();
	});

	it("should call loadPatches when --patch is provided", async () => {
		// Arrange/Act
		await render({
			argv: ["plan", "--patch", "./patches.json"],
			setup: ({ program, processTerm }) => {
				cmdPlan({
					program,
					name: "plan",
					configKey: CONF_GENERATORS,
					cli: makeCli(processTerm),
					stopSpinner: vi.fn(),
				});
			},
		});

		// Assert
		expect(cmdModule.loadPatches).toHaveBeenCalledWith(
			expect.anything(),
			"./patches.json",
		);
	});

	it("should catch error and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "runDeepPlan").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const { exitCode } = await render({
			argv: ["plan", "--in", "./gen.json"],
			setup: ({ program, processTerm }) => {
				cmdPlan({
					program,
					name: "plan",
					configKey: CONF_GENERATORS,
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
