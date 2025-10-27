import { setGenerators } from "@arckate/grimoire-core/config";
import { render } from "@arckate/testing-cli";
import nodePlop from "node-plop";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as findDirModule from "~/src/plop/constructorFindDir";
import * as setupModule from "~/src/plop/setup";

beforeEach(() => {
	vi.resetAllMocks();
	vi.spyOn(setupModule, "default").mockImplementation(() => {});
	vi.spyOn(findDirModule, "constructorFindDir").mockReturnValue(
		((dirName: string) => `mocked/${dirName}`) as any,
	);
});

describe("plopfile.ts", () => {
	const mockResult = {
		config: {
			cliFolder: ".cli",
			configFile: "config.cli",
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

	it("should register simple function generator", async () => {
		const mockFn = vi.fn();
		setGenerators({
			simple: (dir: string) => mockFn(dir),
		} as any);

		await render({
			argv: ["generate"],
			setup: async ({ program }) => {
				program.command("generate").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/dir";

		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});

	it("should register object-style generator with custom nameDir", async () => {
		const mockFn = vi.fn();
		setGenerators({
			custom: {
				generatorsFn: (dir: string) => mockFn(dir),
				nameDir: "custom-dir",
			},
		} as any);

		await render({
			argv: ["generate"],
			setup: async ({ program }) => {
				program.command("generate").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/custom-dir";

		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});

	it("should ignore invalid generator entries", async () => {
		const mockFn = vi.fn();
		setGenerators({
			empty: "", // not a function
			invalid: { generatorsFn: "not-a-function", nameDir: "x" }, // generatorsFn not callable
			valid: (dir: string) => mockFn(dir),
		} as any);

		await render({
			argv: ["generate"],
			setup: async ({ program }) => {
				program.command("generate").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/dir";

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});
});
