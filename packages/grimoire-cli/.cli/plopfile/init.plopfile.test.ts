import {
	clearGlobalConfig,
	setGlobalConfig,
	setInits,
} from "@arckate/grimoire-core/config";
import { render } from "@arckate/testing-cli";
import nodePlop from "node-plop";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as findDirModule from "~/src/plop/constructorInitFindDir";
import * as setupModule from "~/src/plop/setup";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(setupModule, "default").mockImplementation(() => {});
	vi.spyOn(findDirModule, "constructorInitFindDir").mockReturnValue(
		((dirName: string) => `mocked/${dirName}`) as any,
	);
	setGlobalConfig({
		configFile: "custom.config",
		cliFolder: "custom-cli",
	});
});

describe("init.plopfile.ts", () => {
	const mockResult = {
		config: {
			cliFolder: "custom-cli",
			configFile: "custom.config",
			configFileExt: "json",
			configFileType: "camelCase",
			description: "CLI to some JavaScript string utilities",
			dirnamesFile: "dirnames",
			findFile: {},
			genFileExt: "json",
			genFileType: "camelCase",
			name: "grim",
			rootKey: "root",
			version: "0.0.0",
		},
		findDir: "mocked/dir",
	};
	it("should register simple init function", async () => {
		const mockFn = vi.fn();
		setInits({
			setup: (params) => mockFn(params),
		});

		await render({
			argv: ["init"],
			setup: async ({ program }) => {
				program.command("init").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./init.plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/dir";

		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});

	it("should register object-style init with custom nameDir", async () => {
		const mockFn = vi.fn();
		setInits({
			bootstrap: {
				initFn: (params: any) => mockFn(params),
				nameDir: "custom-dir",
			},
		} as any);

		await render({
			argv: ["init"],
			setup: async ({ program }) => {
				program.command("init").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./init.plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/custom-dir";

		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});

	it("should ignore invalid init entries", async () => {
		const mockFn = vi.fn();
		setInits({
			empty: "", // not a function
			invalid: { initFn: "not-a-function", nameDir: "x" }, // invalid initFn
			valid: (params: any) => mockFn(params),
		} as any);

		await render({
			argv: ["init"],
			setup: async ({ program }) => {
				program.command("init").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./init.plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/dir";

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});

	it("should fallback to default configFile and cliFolder", async () => {
		clearGlobalConfig();

		const mockFn = vi.fn();
		setInits({
			default: (params) => mockFn(params),
		});

		await render({
			argv: ["init"],
			setup: async ({ program }) => {
				program.command("init").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./init.plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/dir";
		mockResult.config.cliFolder = ".cli";
		mockResult.config.configFile = "config.cli";

		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});
});
