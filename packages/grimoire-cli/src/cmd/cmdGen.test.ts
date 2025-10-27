import * as cmdModule from "@arckate/grimoire-core/cmd";
import { CONF_GENERATORS, PLOP_FILE } from "@arckate/grimoire-core/const";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdGen } from "./cmdGen";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(pathModule, "findPlopPath").mockReturnValue("mocked/plop/path.js");

	vi.spyOn(pathModule, "findConfig").mockResolvedValue({
		raw: "config",
	} as any);

	vi.spyOn(cmdModule, "mergeGeneratorConfig").mockReturnValue({
		merged: "config",
	} as any);

	vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("mocked/output");

	vi.spyOn(pathModule, "findParentConfig").mockReturnValue({
		parent: true,
	} as any);

	vi.spyOn(cmdModule, "deepFilePlop").mockResolvedValue(undefined);

	vi.spyOn(cmdModule, "findFilePlopArgs").mockImplementation(
		async ({ filePlopFn }) => {
			await filePlopFn(["arg1", "arg2"]);
		},
	);

	vi.spyOn(utilsModule, "logger").mockImplementation(() => {});
	vi.spyOn(utilsModule, "logError").mockImplementation(() => {});
	vi.spyOn(utilsModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdGen", () => {
	it("should run deepFilePlop and exit 0", async () => {
		// Arrange/Act
		const renderPromise = render({
			argv: [
				"gen",
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
				cmdGen({
					program,
					name: "gen",
					config: {
						plop: "custom-plop.js",
						config: "generators.json",
					},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		const { exitCode } = await renderPromise;

		// Assert
		expect(cmdModule.deepFilePlop).toHaveBeenCalledWith(
			expect.objectContaining({
				argsList: ["arg1", "arg2"],
				configPath: "mocked/plop/path.js",
				dest: "mocked/output",
				force: true,
				deep: true,
				ignoreDest: true,
				typeGen: "basic",
				generatorsConfig: { merged: "config" },
				parentConfig: { parent: true },
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should fallback to PLOP_FILE and CONF_GENERATORS", async () => {
		// Arrange/Act
		await render({
			argv: ["gen", "--in", "./gen.json"],
			setup: ({ program, processTerm }) => {
				cmdGen({
					program,
					name: "gen",
					config: {}, // no plop or config
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(pathModule.findPlopPath).toHaveBeenCalledWith(
			expect.objectContaining({ namePlopFile: PLOP_FILE }),
		);

		expect(pathModule.findConfig).toHaveBeenCalledWith(
			expect.objectContaining({ nameConfigFile: CONF_GENERATORS }),
		);
	});

	it("should catch error and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "findFilePlopArgs").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["gen", "--in", "./gen.json"],
			setup: ({ program, processTerm }) => {
				cmdGen({
					program,
					name: "gen",
					config: {},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		const { exitCode } = await renderPromise;

		// Assert
		expect(utilsModule.logger).toHaveBeenCalledWith(
			expect.objectContaining({ args: [""] }),
		);
		expect(utilsModule.formatError).toHaveBeenCalledWith(expect.any(Error));
		expect(utilsModule.logError).toHaveBeenCalledWith(
			expect.objectContaining({ error: "Formatted error" }),
		);
		expect(exitCode).toBe(1);
	});
});
