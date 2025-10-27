import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDirnames, getDirnames } from "./config/dirnames";
import { clearDirs, getDirs } from "./config/dirs";
import { getGlobalConfig } from "./config/global";
import { DIRNAMES_FILE } from "./const/config";
import { DIRS } from "./const/dirs";
import mockOldConfig from "./mockOldConfig";
import { startCliFactory } from "./startCliFactory";

const MockMerge = vi.fn((params) => params);

vi.mock("lodash.merge", async () => {
	const { default: merge } = await vi.importActual("lodash.merge");
	return {
		default: (...params: any[]) => {
			// @ts-expect-error
			const value = (merge as typeof import("lodash.merge"))(...params);
			return MockMerge(value);
		},
	};
});

vi.mock("commander", async () => {
	const actual = await vi.importActual<typeof import("commander")>("commander");
	return {
		...actual,
		Command: class extends actual.Command {
			parse() {
				return this;
			}
		},
	};
});

const MockFindConfig = vi.fn();
vi.mock("./path/findConfig", async () => {
	return { findConfig: (params: any) => MockFindConfig(params) };
});

const MockOraStart = vi.fn();
const MockOraStop = vi.fn();

vi.mock("ora", () => ({
	default: () => ({
		start: () => {
			MockOraStart();
			return {
				stop: () => MockOraStop(),
			};
		},
	}),
}));

describe("startCli", () => {
	const defaultDir = path.join("./mockOldConfig.ts");

	const mockCmdFn = vi.fn();
	const mockConfig = {
		name: "TestCLI",
		description: "A test CLI",
		version: "1.0.0",
		commands: {
			greet: {
				cmdFn: mockCmdFn,
				description: "Say hello",
			},
		},
	};

	beforeEach(() => {
		mockCmdFn.mockClear();
		MockFindConfig.mockClear();
		clearDirs();
		clearDirnames();
	});

	it("should call cmdFn", async () => {
		// Arrange/Act
		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);

		const testDir = "/mock/dir";
		await startCliFactory(defaultDir, mockOldConfig)(mockConfig, testDir);

		// Arrange// Act// Assert
		expect(mockCmdFn).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "greet",
				config: { description: "Say hello" },
				dir: testDir,
				stopSpinner: expect.any(Function),
			}),
		);
	});

	it("should call setDirs", async () => {
		// Arrange/Act
		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);
		const testDir = "/mock/dir";
		await startCliFactory(defaultDir, mockOldConfig)(mockConfig, testDir);

		// Assert
		const result = {
			[DIRS.DIR]: getDirs(DIRS.DIR),
			[DIRS.DEFAULT_DIR]: getDirs(DIRS.DEFAULT_DIR),
			[DIRS.IN_PATH]: getDirs(DIRS.IN_PATH),
		};

		expect(result).toEqual({
			[DIRS.DIR]: "/mock/dir",
			[DIRS.DEFAULT_DIR]: "mockOldConfig.ts",
			[DIRS.IN_PATH]: null,
		});
	});

	it("should call setGlobalConfig", async () => {
		// Arrange/Act
		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);
		const testDir = "/mock/dir";
		await startCliFactory(defaultDir, mockOldConfig)(mockConfig, testDir);

		const result = getGlobalConfig();

		// Assert
		expect(result).toEqual({
			name: "TestCLI",
			cliFolder: ".cli",
			rootKey: "root",
			dirnamesFile: "dirnames",
			description: "A test CLI",
			version: "1.0.0",
			configFile: "config.cli",
			configFileExt: "json",
			configFileType: "camelCase",
			genFileExt: "json",
			genFileType: "camelCase",
			findFile: {
				json: {
					camelCase: {
						read: expect.any(Function),
						write: expect.any(Function),
						stringTo: expect.any(Function),
					},
				},
			},
			commands: {
				init: {
					cmdFn: expect.any(Function),
					plop: "plopfile/init.plopfile.ts",
					config: "inits",
				},
				extract: {
					cmdFn: expect.any(Function),
					plop: "plopfile/extract.plopfile.ts",
					config: "extracts",
				},
				new: {
					cmdFn: expect.any(Function),
					plop: "plopfile/plopfile.ts",
					config: "generators",
				},
				gen: {
					cmdFn: expect.any(Function),
					plop: "plopfile/plopfile.ts",
					config: "generators",
				},
				start: {
					cmdFn: expect.any(Function),
					plop: "plopfile/plopfile.ts",
					config: "starters",
				},
				greet: { cmdFn: mockCmdFn, description: "Say hello" },
			},
			actions: {
				copy: expect.any(Function),
				addFolder: expect.any(Function),
				copyTo: expect.any(Function),
				addTo: expect.any(Function),
				copyFolder: expect.any(Function),
			},
		});
	});

	it("should configure program name, description and version", async () => {
		// Arrange/Act
		const spyName = vi.spyOn(require("commander").Command.prototype, "name");
		const spyDescription = vi.spyOn(
			require("commander").Command.prototype,
			"description",
		);
		const spyVersion = vi.spyOn(
			require("commander").Command.prototype,
			"version",
		);

		const testDir = "/mock/dir";
		await startCliFactory(defaultDir, mockOldConfig)(
			{
				name: null,
				description: null,
				version: null,
			},
			testDir,
		);

		// Assert
		expect(spyName).toHaveBeenCalledWith(expect.any(String));
		expect(spyDescription).toHaveBeenCalledWith(expect.any(String));
		expect(spyVersion).toHaveBeenCalledWith(expect.any(String));

		spyName.mockRestore();
		spyDescription.mockRestore();
		spyVersion.mockRestore();
	});

	it("should fallback to empty commands object if config.commands is undefined", async () => {
		// Arrange/Act
		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);
		const testDir = "/mock/dir";

		// config sans .commands
		const configWithoutCommand = {
			name: "FallbackCLI",
			description: "Fallback test",
			version: "0.0.1",
		};

		const mockConfig = {
			...configWithoutCommand,
			commands: "",
		};

		await startCliFactory(defaultDir, mockOldConfig)(
			mockConfig as any,
			testDir,
		);

		// Act
		const global = getGlobalConfig();

		// Arrange
		expect(global.name).toBe("FallbackCLI");
	});

	it("should pass config.dirnamesFile when defined", async () => {
		// Arrange/Act
		const testDir = "/mock/dir";
		const customFile = "custom-dirnames.json";

		MockFindConfig.mockReturnValue(
			Promise.resolve({
				dirConfig: {},
				defaultDirConfig: {},
				rootConfig: {},
			}),
		);

		await startCliFactory(defaultDir, mockOldConfig)(
			{ ...mockConfig, dirnamesFile: customFile },
			testDir,
		);

		// Assert
		expect(MockFindConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				nameConfigFile: customFile,
			}),
		);
	});

	it("should fallback to DIRNAMES_FILE when config.dirnamesFile is undefined", async () => {
		// Arrange/Act
		MockMerge.mockImplementation((params) => {
			if (params.description === "mock") {
				return {
					...mockConfig,
					dirnamesFile: undefined,
				};
			}
			return params;
		});

		const testDir = "/mock/dir";

		MockFindConfig.mockReturnValue(
			Promise.resolve({
				defaultDirConfig: {},
				dirConfig: {},
				rootConfig: { test: "test" },
			}),
		);

		const configWithoutDirnamesFile = { description: "mock" };

		await startCliFactory(defaultDir, mockOldConfig)(
			configWithoutDirnamesFile,
			testDir,
		);

		// Assert
		expect(MockFindConfig).toHaveBeenCalledWith(
			expect.objectContaining({
				dir: "/mock/dir",
				nameConfigFile: DIRNAMES_FILE,
			}),
		);

		expect(getDirnames()).toMatchObject({ test: "test" });
	});

	it("should pass stopSpinner to cmdFn and call spinner.stop", async () => {
		// Arrange/Act
		MockMerge.mockImplementation((params) => {
			return params;
		});

		MockFindConfig.mockReturnValue(
			Promise.resolve({
				defaultDirConfig: {},
				dirConfig: {},
				rootConfig: { test: "test" },
			}),
		);

		const config = {
			commands: {
				test: {
					cmdFn: ({ stopSpinner }) => {
						stopSpinner();
					},
					description: "desc",
				},
			},
		};

		await startCliFactory(defaultDir, mockOldConfig)(config, "/mock/dir");

		// Assert
		expect(MockOraStart).toHaveBeenCalled();
		expect(MockOraStop).toHaveBeenCalled();
	});
});
