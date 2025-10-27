import * as cmdModule from "@arckate/grimoire-core/cmd";
import * as configModule from "@arckate/grimoire-core/config";
import { CONF_EXTRACTS, INIT_PLOP_FILE } from "@arckate/grimoire-core/const";
import * as pathModule from "@arckate/grimoire-core/path";
import * as utilsModule from "@arckate/grimoire-core/utils";
import { render } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cmdExtract } from "./cmdExtract";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(pathModule, "findPlopPath").mockReturnValue("mocked/plop/path.js");

	vi.spyOn(pathModule, "findConfig").mockResolvedValue({
		raw: "config",
	} as any);

	vi.spyOn(cmdModule, "mergeExtractsConfig").mockReturnValue({
		merged: "extracts",
	} as any);

	vi.spyOn(configModule, "setExtracts").mockImplementation(() => {});

	vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("mocked/output");

	vi.spyOn(cmdModule, "cmdPlop").mockResolvedValue(undefined);

	vi.spyOn(utilsModule, "logger").mockImplementation(() => {});
	vi.spyOn(utilsModule, "logError").mockImplementation(() => {});
	vi.spyOn(utilsModule, "formatError").mockReturnValue(
		"Formatted error" as any,
	);
});

describe("cmdExtract", () => {
	it("should run cmdPlop and exit 0", async () => {
		// Arrange/Act
		const renderPromise = render({
			argv: ["extract", "user", "--out", "./output", "--force"],
			setup: ({ program, processTerm }) => {
				cmdExtract({
					program,
					name: "extract",
					config: {
						plop: "custom-plop.js",
						config: "extracts.json",
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
				args: ["user"],
				configPath: "mocked/plop/path.js",
				dest: "mocked/output",
				force: true,
				processTerm: expect.any(Object),
			}),
		);
		expect(exitCode).toBe(0);
	});

	it("should fallback to INIT_PLOP_FILE and CONF_EXTRACTS", async () => {
		// Arrange/Act
		await render({
			argv: ["extract", "user"],
			setup: ({ program, processTerm }) => {
				cmdExtract({
					program,
					name: "extract",
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
			expect.objectContaining({ namePlopFile: INIT_PLOP_FILE }),
		);

		expect(pathModule.findConfig).toHaveBeenCalledWith(
			expect.objectContaining({ nameConfigFile: CONF_EXTRACTS }),
		);
	});

	it("should call setExtracts with merged config", async () => {
		// Arrange/Act
		await render({
			argv: ["extract", "user"],
			setup: ({ program, processTerm }) => {
				cmdExtract({
					program,
					name: "extract",
					config: {},
					dir: "./fixtures",
					defaultDir: "./defaults",
					stopSpinner: () => {},
					processTerm,
				});
			},
		});

		// Assert
		expect(configModule.setExtracts).toHaveBeenCalledWith({
			merged: "extracts",
		});
	});

	it("should catch error and exit 1", async () => {
		// Arrange/Act
		vi.spyOn(cmdModule, "cmdPlop").mockRejectedValueOnce(
			new Error("Mocked failure"),
		);

		const renderPromise = render({
			argv: ["extract", "fail"],
			setup: ({ program, processTerm }) => {
				cmdExtract({
					program,
					name: "extract",
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
