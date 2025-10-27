import * as cmdModule from "@arckate/grimoire-core/cmd";
import * as configModule from "@arckate/grimoire-core/config";
import { CONF_GENERATORS, PLOP_FILE } from "@arckate/grimoire-core/const";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdNew } from "./cmdNew";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(pathModule, "findPlopPath").mockReturnValue("mocked/plop/path.js");

	vi.spyOn(pathModule, "findConfig").mockResolvedValue({
		config: "raw",
	} as any);

	vi.spyOn(cmdModule, "mergeGeneratorConfig").mockReturnValue({
		merged: "config",
	} as any);

	vi.spyOn(cmdModule, "findGenerators").mockResolvedValue([
		{ name: "cli" },
	] as any);

	vi.spyOn(configModule, "setGenerators").mockImplementation(() => {});

	vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("mocked/output");

	vi.spyOn(cmdModule, "cmdPlop").mockResolvedValue(undefined);

	vi.spyOn(utilsModule, "logger").mockImplementation(() => {});
	vi.spyOn(utilsModule, "logError").mockImplementation(() => {});
	vi.spyOn(utilsModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdNew", () => {
	it("should run cmdPlop and exit 0", async () => {
		// Arrange/Act
		const renderPromise = render({
			argv: [
				"new",
				"cli",
				"--out",
				"./output",
				"--force",
				"--type-gen",
				"basic",
			],
			setup: ({ program, processTerm }) => {
				cmdNew({
					program,
					name: "new",
					config: {
						plop: "plopfile.js",
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
		expect(cmdModule.cmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: expect.arrayContaining(["cli"]),
				configPath: "mocked/plop/path.js",
				dest: "mocked/output",
				force: true,
				ignorePrompts: false,
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should fallback to PLOP_FILE and CONF_GENERATORS", async () => {
		// Arrange/Act
		await render({
			argv: ["new", "cli"],
			setup: ({ program, processTerm }) => {
				cmdNew({
					program,
					name: "new",
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
		vi.spyOn(cmdModule, "cmdPlop").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["new", "bad"],
			setup: ({ program, processTerm }) => {
				cmdNew({
					program,
					name: "new",
					config: {
						plop: "plopfile.js",
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
