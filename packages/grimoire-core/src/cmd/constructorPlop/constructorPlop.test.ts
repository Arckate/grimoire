import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearGenerators, getGenerators } from "~/config/generators";
import { StarterConfigError } from "~/errors/StarterConfigError";
import * as readConfigCliFileModule from "~/utils/readConfigCliFile";
import { constructorPlop } from "./constructorPlop";

const MockLogger = vi.fn();
vi.mock("~/utils/logger", () => ({
	logger: ({ args }: { args: any[] }) => MockLogger(...args),
	logError: vi.fn(),
}));

const MockSearchList = vi.fn();
vi.mock("~/prompts/searchList", () => ({
	searchList: (values: any) => MockSearchList(values),
}));

const MockInput = vi.fn();
vi.mock("~/prompts", () => ({
	input: (params: any) => MockInput(params),
}));

vi.mock("~/starter/findStarter", () => {
	const findStarter = (config: Record<string, any>, name: string) =>
		Promise.resolve(config[name]);
	return { findStarter };
});

type GeneratorsConfig = Record<string, Record<string, any>>;
interface MockFindGeneratorsParams {
	config: GeneratorsConfig;
	typeGen: keyof GeneratorsConfig;
}
vi.mock("../generators", () => {
	const findGenerators = ({ config, typeGen }: MockFindGeneratorsParams) =>
		config[typeGen] || { [typeGen]: "mockedGen" };
	return { findGenerators };
});

const MockCallCmdPlop = vi.fn((value = false) => value);
const MockParamsCmdPlop = vi.fn();
vi.mock("../cmdPlop", () => ({
	cmdPlop: async (params: any) => {
		MockParamsCmdPlop(params);
		MockCallCmdPlop(true);
	},
}));

const MockDeepFilePlop = vi.fn((value = false) => value);
vi.mock("../filePlop", () => ({
	deepFilePlop: async (params: any) => MockDeepFilePlop(params),
}));

const MockArgs = vi.fn();
const MockInPath = vi.fn();
vi.mock("../findFilePlopArgs", () => ({
	findFilePlopArgs: async ({ filePlopFn, inPath }: any) => {
		MockInPath(inPath);
		return filePlopFn(MockArgs());
	},
}));

const MockPathConstructor = vi.fn();
vi.mock("~/path/pathConstructor", () => ({
	pathConstructor: (value: any) => MockPathConstructor(value),
}));

describe("constructorPlop", () => {
	const processTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};

	const baseConfig: any = {
		starterConfig: {
			testStarter: {},
		},
		configPath: "/config",
		generatorsConfig: {},
		processTerm,
	};

	beforeEach(() => {
		clearGenerators();
		MockSearchList.mockReset();
		MockCallCmdPlop.mockClear();
		MockParamsCmdPlop.mockClear();
		MockDeepFilePlop.mockClear();
		MockPathConstructor.mockClear();
		MockArgs.mockClear();
		MockInPath.mockClear();
		MockInput.mockClear();
	});

	it("should throw StarterConfigError for UNKNOWN step", async () => {
		// Arrange/Act/Assert
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		baseConfig.starterConfig.testStarter = {
			step1: { foo: "bar" },
		};
		await expect(() =>
			constructorPlop({
				...baseConfig,
				args: ["testStarter"],
			}),
		).rejects.toThrow(StarterConfigError);
	});

	it("should handle FILTER and resolve nested CMD_PLOP", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/filter-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				keyFilter: "level",
				defaultFilter: "default",
				values: {
					default: { generator: "component", typeGen: "react", params: {} },
				},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockPathConstructor).toHaveBeenCalled();
	});

	it("should handle STARTER and call constructorPlop recursively", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/starter-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				starterName: "nestedStarter",
				nameSpace: "ns/",
			},
		};
		baseConfig.starterConfig.nestedStarter = {
			step2: { generator: "component", typeGen: "react", params: {} },
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockPathConstructor).toHaveBeenCalled();
	});

	it("should handle CMD_PLOP and call cmdPlop and setGenerators", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/cmd-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				typeGen: "react",
				params: {},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockCallCmdPlop).toHaveBeenCalledWith(true);
		expect(MockPathConstructor).toHaveBeenCalled();
		expect(getGenerators()).toEqual({ react: "mockedGen" });
	});

	it("should handle FILE_PLOP and call deepFilePlop with correct args", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/file-path");
		MockArgs.mockReturnValue(["arg1", "arg2"]);

		baseConfig.starterConfig.testStarter = {
			step1: {
				in: "files",
				typeGen: "react",
				force: true,
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockInPath).toHaveBeenCalledWith("files");
		expect(MockArgs).toHaveBeenCalled();
		expect(MockDeepFilePlop).toHaveBeenCalledWith(
			expect.objectContaining({ argsList: ["arg1", "arg2"] }),
		);
	});

	it("should handle MULTI_CHOICE with fallback and nested CMD_PLOP", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockSearchList.mockResolvedValue("tanStack");
		MockPathConstructor.mockResolvedValue("/multi-choice-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				question: "Choose framework",
				key: "framework",
				values: {
					tanStack: { generator: "component", typeGen: "react", params: {} },
					default: { in: "files", typeGen: "react" },
				},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockSearchList).toHaveBeenCalledWith({
			message: "Choose framework",
			list: ["tanStack", "default"],
			processTerm,
		});
		expect(MockPathConstructor).toHaveBeenCalled();
	});

	it("should handle MULTI_CHOICE with FILTER values and apply filterValues", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockSearchList.mockResolvedValue("typeGen");
		MockPathConstructor.mockResolvedValue("/filtered-multi-choice-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				question: "Choose config",
				key: "configType",
				values: {
					keyFilter: "level",
					defaultFilter: "default",
					values: {
						default: {
							generator: "component",
							typeGen: "react",
							params: "unknown",
						},
					},
				},
			},
		};

		const filters = { level: "default" };

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
			filters,
		});

		// Assert
		expect(result).toBe(true);
		expect(MockSearchList).toHaveBeenCalledWith({
			message: "Choose config",
			list: ["generator", "typeGen", "params"],
			processTerm,
		});
	});

	it("should warn when MULTI_CHOICE value is not in the list", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockSearchList.mockResolvedValue("default");
		MockPathConstructor.mockResolvedValue("/warn-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				question: "Choose framework",
				key: "framework",
				otherKey: ["alias"],
				values: {
					tanStack: { generator: "component", typeGen: "react", params: {} },
					default: { in: "files", typeGen: "react" },
				},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter", { framework: "unknownValue" }],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockSearchList).toHaveBeenCalled();
		expect(MockLogger).toHaveBeenCalledWith(
			expect.stringMatching(/⚠/),
			expect.stringMatching(/framework/),
			expect.stringMatching(/unknownValue/),
			expect.stringMatching(/isn't in the list/),
		);
	});

	it("should prioritize step.force over global force", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/force-step-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				typeGen: "react",
				params: {},
				force: true,
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
			force: false,
		});

		// Assert
		expect(result).toBe(true);
		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({ force: true }),
		);
	});

	it("should pass step.params to cmdPlop args when defined", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/cmd-params-path");

		const params = { name: "michel", type: "service" };

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				typeGen: "react",
				params,
			},
		};

		await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", params],
			}),
		);
	});

	it("should fallback to empty object for cmdPlop args when step.params is undefined", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/cmd-no-params-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				typeGen: "react",
			},
		};

		await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", {}],
			}),
		);
	});

	it("should fallback to 'default' when step.typeGen is undefined", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/fallback-typegen-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				generator: "component",
				// typeGen is intentionally omitted
				params: {},
			},
		};

		await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", {}],
			}),
		);

		expect(getGenerators()).toEqual({ default: "mockedGen" });
	});

	it("should fallback to 'default' when step.typeGen is undefined in FILE_PLOP", async () => {
		// Arrange/Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		MockPathConstructor.mockResolvedValue("/file-fallback-path");
		MockArgs.mockReturnValue(["arg1", "arg2"]);

		baseConfig.starterConfig.testStarter = {
			step1: {
				in: "files",
				// typeGen is intentionally omitted
				force: true,
				deep: true,
				ignoreDest: false,
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockDeepFilePlop).toHaveBeenCalledWith(
			expect.objectContaining({
				typeGen: "default",
			}),
		);
	});

	it("should handle INIT and call cmdPlop with initGenerator", async () => {
		// Arrange/Act
		MockPathConstructor.mockResolvedValue("/init-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				initGenerator: "init-script",
				params: { foo: "bar" },
				force: true,
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
			dest: "/mocked/dest",
		});

		// Assert
		expect(result).toBe(true);
		expect(MockCallCmdPlop).toHaveBeenCalledWith(true);
		expect(MockParamsCmdPlop).toHaveBeenCalledWith({
			args: ["init-script", { foo: "bar" }],
			configPath: baseConfig.configPath,
			ignorePrompts: false,
			dest: "/init-path",
			force: true,
			processTerm,
		});
		expect(MockPathConstructor).toHaveBeenCalledWith("/mocked/dest");
	});

	it("should call cmdPlop with empty params when step.params is undefined", async () => {
		// Arrange/Act
		MockPathConstructor.mockResolvedValue("/init-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				initGenerator: "init-script",
				// params intentionally omitted
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
			dest: "/init-dest",
		});

		// Assert
		expect(result).toBe(true);
		expect(MockParamsCmdPlop).toHaveBeenCalledWith({
			args: ["init-script", {}], // 👈 fallback to empty object
			configPath: baseConfig.configPath,
			ignorePrompts: false,
			dest: "/init-path",
			force: false,
			processTerm,
		});
	});

	it("should skip filterValues when step.values is of type CMD_PLOP", async () => {
		// Arrange/Act
		MockSearchList.mockResolvedValue("cli");
		MockPathConstructor.mockResolvedValue("/cmd-plop-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				key: "typeGen",
				otherKey: ["alias"],
				question: "Choose generator type",
				values: {
					generator: "component",
					typeGen: "react",
				},
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
	});

	it("should trigger MULTI_CHOICE after STARTER type ", async () => {
		// Arrange/Act
		MockPathConstructor.mockResolvedValue("/cmd-plop-path");

		baseConfig.starterConfig.testSubStarter = {
			step1: {
				key: "typeGen",
				otherKey: ["alias"],
				question: "Choose generator type",
				values: {
					foo: "component",
					typeGen: "react",
				},
			},
			step2: {
				keys: { params: { foo: "typeGen", test: "alias" } },
				value: { generator: "component", typeGen: "react", params: {} },
			},
		};

		baseConfig.starterConfig.testStarter = {
			step1: {
				key: "username",
				otherKey: ["subTypeGen"],
				inputQuestion: "Your name?",
			},
			step2: {
				starterName: "testSubStarter",
				nameSpace: "sub",
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter", "foo"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", { foo: "component", test: "component" }],
			}),
		);
	});

	it("should skip searchList when value is valid and present in list", async () => {
		// Arrange/Act/Assert
		MockPathConstructor.mockResolvedValue("/valid-value-path");

		baseConfig.starterConfig.testStarter = {
			step1: {
				key: "typeGen",
				question: "Choose generator type",
				values: {
					cli: {
						genName: "cli",
						genDest: "./generated",
					},
					web: {
						genName: "web",
						genDest: "./generated",
					},
				},
			},
		};

		await expect(
			constructorPlop({
				...baseConfig,
				args: ["testStarter", { typeGen: "cli" }],
			}),
		).rejects.toThrowError(new StarterConfigError("bad starter format"));

		expect(MockSearchList).not.toHaveBeenCalled();
	});

	it("should use value from findConstructorArg when available", async () => {
		// Arrange
		baseConfig.starterConfig.testStarter = {
			step1: {
				key: "username",
				inputQuestion: "Your name?",
			},
		};

		// Act
		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter", "test"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockInput).not.toHaveBeenCalled();
	});

	it("should fallback to input() when findConstructorArg returns null", async () => {
		// Arrange
		baseConfig.starterConfig.testStarter = {
			step1: {
				key: "username",
				inputQuestion: "Your name?",
			},
		};
		MockInput.mockResolvedValue("Bob");

		// Act
		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockInput).toHaveBeenCalledWith({
			message: "Your name?",
			processTerm,
		});
	});

	it("should assign value to both key and otherKey when provided", async () => {
		// Arrange
		baseConfig.starterConfig.testStarter = {
			step1: {
				key: "username",
				otherKey: ["alias"],
				inputQuestion: "Your name?",
			},
		};

		// Act
		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockInput).toHaveBeenCalledWith({
			message: "Your name?",
			processTerm,
		});
	});

	it("should assign value to both key and otherKey when provided with sub starter", async () => {
		// Arrange
		baseConfig.starterConfig.testSubStarter = {
			step1: {
				key: "username",
				otherKey: ["alias"],
				inputQuestion: "Your name?",
			},
			step2: {
				keys: { params: { foo: "username", test: "alias" } },
				value: { generator: "component", typeGen: "react", params: {} },
			},
		};
		baseConfig.starterConfig.testStarter = {
			step1: {
				key: "username",
				otherKey: ["subUsername"],
				inputQuestion: "Your name?",
			},
			step2: {
				starterName: "testSubStarter",
				nameSpace: "sub",
			},
		};

		// Act
		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter", "bar"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockInput).not.toHaveBeenCalled();
		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", { foo: "bar", test: "bar" }],
			}),
		);
	});

	it("should call setValues and then constructorStep with returned value", async () => {
		// Arrange/Act
		baseConfig.starterConfig.testStarter = {
			step1: {
				key: "username",
				inputQuestion: "Your name?",
			},
			step2: {
				keys: { params: { foo: "username" } },
				value: { generator: "component", typeGen: "react", params: {} },
			},
		};

		const result = await constructorPlop({
			...baseConfig,
			args: ["testStarter", "bar"],
		});

		// Assert
		expect(result).toBe(true);
		expect(MockParamsCmdPlop).toHaveBeenCalledWith(
			expect.objectContaining({
				args: ["component", { foo: "bar" }],
			}),
		);
	});
});
