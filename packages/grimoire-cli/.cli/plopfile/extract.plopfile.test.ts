import { setExtracts, setGlobalConfig } from "@arckate/grimoire-core/config";
import { render } from "@arckate/testing-cli";
import nodePlop from "node-plop";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as findDirModule from "~/src/plop/constructorExtractFindDir";
import * as setupModule from "~/src/plop/setup";

beforeEach(() => {
	vi.resetAllMocks();

	vi.spyOn(setupModule, "default").mockImplementation(() => {});
	vi.spyOn(findDirModule, "constructorExtractFindDir").mockReturnValue(
		((dirName: string) => `mocked/${dirName}`) as any,
	);

	setGlobalConfig({
		configFile: "custom.config",
	});
});

describe("extract.plopfile.ts", () => {
	const mockResult = {
		config: {
			cliFolder: ".cli",
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
	it("should register simple extract function", async () => {
		const mockFn = vi.fn();
		setExtracts({
			simple: (dir: string) => mockFn(dir),
		} as any);

		await render({
			argv: ["extract"],
			setup: async ({ program }) => {
				program.command("extract").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./extract.plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/dir";
		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});

	it("should register object-style extract with custom nameDir", async () => {
		const mockFn = vi.fn();
		setExtracts({
			custom: {
				extractsFn: (dir: string) => mockFn(dir),
				nameDir: "custom-dir",
			},
		} as any);

		await render({
			argv: ["extract"],
			setup: async ({ program }) => {
				program.command("extract").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./extract.plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/custom-dir";
		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});

	it("should ignore invalid extract entries", async () => {
		const mockFn = vi.fn();
		setExtracts({
			empty: "", // not a function
			invalid: { extractsFn: "not-a-function", nameDir: "x" }, // invalid extractsFn
			valid: (dir: string) => mockFn(dir),
		} as any);

		await render({
			argv: ["extract"],
			setup: async ({ program }) => {
				program.command("extract").action(async () => {
					const plop = await nodePlop();
					const { default: plopfile } = await import("./extract.plopfile");
					await plopfile(plop);
				});
			},
		});

		mockResult.findDir = "mocked/dir";

		expect(mockFn).toHaveBeenCalledTimes(1);
		expect(mockFn).toHaveBeenCalledWith(mockResult);
	});
});
