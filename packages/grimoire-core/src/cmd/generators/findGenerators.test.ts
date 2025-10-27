import { render, userEvent } from "@arckate/testing-cli";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as globalModule from "~/config/global";
import * as rootsModule from "~/config/roots";
import { ROOTS } from "~/const/roots";
import type { GeneratorsConfig } from "~/entities/Generators";
import * as findRootsModule from "~/path/findRoots";
import * as readConfigCliFileModule from "~/utils/readConfigCliFile";
import { findGenerators } from "./findGenerators";

const MockExistsSync = vi.fn((_params) => true);

vi.mock("node:fs", () => ({
	default: {
		existsSync: (params: string) => MockExistsSync(params),
	},
}));

const createGen = (label: string) => () => ({
	description: `Generator for ${label}`,
});

describe("findGenerators", () => {
	const globalProcessTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetModules();
	});

	it("should return generators directly if subGenConf is false", async () => {
		// Arrange/Act
		const config: GeneratorsConfig = {
			defaultGen: createGen("default"),
			otherGen: createGen("other"),
		};

		// Assert
		const result = await findGenerators({
			config,
			typeGen: "defaultGen",
			processTerm: globalProcessTerm,
		});
		expect(typeof result.defaultGen).toBe("function");
	});

	it("should return group if typeGen is valid", async () => {
		// Arrange/Act
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("component"),
			},
		};

		// Assert
		const result = await findGenerators({
			config,
			typeGen: "react",
			processTerm: globalProcessTerm,
		});
		expect(typeof result.component).toBe("function");
	});

	it("should prompt if typeGen is invalid by command ", async () => {
		// Arrange
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("component"),
			},
			vue: {
				component: createGen("vue"),
			},
		};

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const selected = await findGenerators({
						config,
						typeGen: "angular",
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.type("vue");
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const warning = stdout.getInLast(
			"⚠ Type Generators angular isn't in the list",
		);
		expect(warning).toBeInTerm();
		const question = stdout.getInAll(
			"? Please choose a type of generator list vue",
		);
		expect(question).toBeInTerm();
		const selected = stdout.getInLast("Selected: component");
		expect(selected).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should prompt if typeGen is missing", async () => {
		// Arrange
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({});
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
			vue: {
				component: createGen("vue"),
			},
		};

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const selected = await findGenerators({ config, processTerm });
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const result = stdout.getInFirst("Please choose a type of generator list");
		expect(result).toBeInTerm();
		const selected = stdout.getInLast("Selected: component");
		expect(selected).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should return generators from rootTypeGen when typeGen is missing", async () => {
		// Arrange/ Act
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});

		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
		};

		const result = await findGenerators({
			config,
			processTerm: globalProcessTerm,
		});

		// Assert
		expect(typeof result.component).toBe("function");
	});

	it("should build parentConfig path using getGlobalConfig when parent is missing", async () => {
		// Arrange/ Act
		vi.spyOn(rootsModule, "getRoots").mockReturnValue(null);
		vi.spyOn(findRootsModule, "findRoots").mockReturnValue({
			"~": null,
		} as any);
		vi.spyOn(globalModule, "getGlobalConfig").mockReturnValue({});
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});

		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
		};

		const result = await findGenerators({
			config,
			processTerm: globalProcessTerm,
		});

		// Assert
		expect(typeof result.component).toBe("function");
	});

	it("should prompt if typeGen is invalid by file", async () => {
		// Arrange
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "angular",
		});
		const config: GeneratorsConfig = {
			subGenConf: true,
			react: {
				component: createGen("react"),
			},
			vue: {
				component: createGen("vue"),
			},
		};

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const selected = await findGenerators({ config, processTerm });
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const warning = stdout.getInLast(
			"⚠ Type Generators angular isn't in the list",
		);
		expect(warning).toBeInTerm();
		const result = stdout.getInFirst("Please choose a type of generator list");
		expect(result).toBeInTerm();
		const selected = stdout.getInLast("Selected: component");
		expect(selected).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should skip reading parentConfig when file does not exist", async () => {
		const config: GeneratorsConfig = {
			subGenConf: true,
			cli: { component: createGen("component") },
		};

		vi.spyOn(rootsModule, "getRoots").mockReturnValue(null);
		vi.spyOn(findRootsModule, "findRoots").mockReturnValue({
			[ROOTS.PARENT]: "/project",
		} as any);
		vi.spyOn(rootsModule, "setRoots").mockImplementation(() => {});
		vi.spyOn(globalModule, "getGlobalConfig").mockReturnValue({
			configFile: "config",
			configFileExt: "js",
		});
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "cli",
		});

		MockExistsSync.mockReturnValue(false);

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["cmd"],
			setup: ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					const result = await findGenerators({
						config,
						processTerm,
					});
					expect(typeof result.component).toBe("function");
					processTerm.exit(0);
				});
			},
		});

		user.type("cli");
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		const result = stdout.getInFirst("Please choose a type of generator list");
		expect(result).toBeInTerm();
		const selected = stdout.getInLast("You use type cli");
		expect(selected).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
