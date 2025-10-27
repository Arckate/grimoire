import { render, userEvent } from "@arckate/testing-cli";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import type { Cli } from "~/Cli";
import { ROOTS } from "~/const/roots";
import type {
	GeneratorsConfig,
	GeneratorsSubConfig,
} from "~/models/Generators";
import * as findRootsModule from "~/path/findRoots";
import * as readConfigCliFileModule from "~/utils/readConfigCliFile";
import { removeLinePrompt, typeGeneratorsPrompt } from "~/prompts";
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

const makeCli = (
	opts: {
		processTerm?: any;
		dirs?: Record<string, string | null>;
		config?: Record<string, string>;
	} = {},
): Cli =>
	({
		getProcessTerm: () => opts.processTerm ?? {},
		getDirs: vi.fn().mockReturnValue(opts.dirs ?? {}),
		getConfig: vi.fn().mockReturnValue(opts.config ?? {}),
		setDirs: vi.fn(),
		getPrompts: () => ({ cliTypeGenerators: typeGeneratorsPrompt, cliRemoveLine: removeLinePrompt }),
	}) as unknown as Cli;

describe("findGenerators", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		MockExistsSync.mockReturnValue(true);
		vi.stubGlobal("structuredClone", (obj: unknown) =>
			typeof obj === "object" && obj !== null ? { ...(obj as object) } : obj,
		);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	it("should return generators directly if subGenConf is false", async () => {
		const config: GeneratorsConfig = {
			defaultGen: createGen("default"),
			otherGen: createGen("other"),
		};

		const result = await findGenerators({
			cli: makeCli(),
			config,
			typeGen: "defaultGen",
		});

		expect(typeof result.defaultGen).toBe("function");
	});

	it("should return group if typeGen is valid", async () => {
		const config = {
			subGenConf: true as const,
			react: { component: createGen("component") },
		} as unknown as GeneratorsSubConfig;

		const result = await findGenerators({
			cli: makeCli(),
			config,
			typeGen: "react",
		});

		expect(typeof result.component).toBe("function");
	});

	it("should prompt if typeGen is invalid by command", async () => {
		const config = {
			subGenConf: true as const,
			react: { component: createGen("component") },
			vue: { component: createGen("vue") },
		} as unknown as GeneratorsSubConfig;

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const cli = makeCli({ processTerm });
					const selected = await findGenerators({
						cli,
						config,
						typeGen: "angular",
					});
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.type("vue");
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Type Generator angular isn't in the list")).toBeInTerm();
		expect(stdout.getInFirst("Please choose a valid type of generator")).toBeInTerm();
		expect(stdout.getInLast("You use type generator vue")).toBeInTerm();
		expect(stdout.getInLast("Selected: component")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should prompt if typeGen is missing", async () => {
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({});
		const config = {
			subGenConf: true as const,
			react: { component: createGen("react") },
			vue: { component: createGen("vue") },
		} as unknown as GeneratorsSubConfig;

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const cli = makeCli({
						processTerm,
						dirs: { [ROOTS.PARENT]: "/project" },
					});
					const selected = await findGenerators({ cli, config });
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Please choose a type of generator")).toBeInTerm();
		expect(stdout.getInLast("Selected: component")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should return generators from rootTypeGen when typeGen is missing", async () => {
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});

		const config = {
			subGenConf: true as const,
			react: { component: createGen("react") },
		} as unknown as GeneratorsSubConfig;
		const cli = makeCli({
			dirs: { [ROOTS.PARENT]: "/project" },
			config: {},
		});

		const result = await findGenerators({ cli, config });

		expect(typeof result.component).toBe("function");
	});

	it("should call findRoots to resolve parent when ROOTS.PARENT is not in dirs", async () => {
		vi.spyOn(findRootsModule, "findRoots").mockReturnValue({
			[ROOTS.PARENT]: "/found-parent",
		} as any);
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});

		const config = {
			subGenConf: true as const,
			react: { component: createGen("react") },
		} as unknown as GeneratorsSubConfig;
		const cli = makeCli({ dirs: {}, config: {} });

		const result = await findGenerators({ cli, config });

		expect(findRootsModule.findRoots).toHaveBeenCalled();
		expect(cli.setDirs).toHaveBeenCalledWith({
			[ROOTS.PARENT]: "/found-parent",
		});
		expect(typeof result.component).toBe("function");
	});

	it("uses './' as parent and skips setDirs when findRoots returns no PARENT", async () => {
		vi.spyOn(findRootsModule, "findRoots").mockReturnValue({
			[ROOTS.PARENT]: null,
		} as any);
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});

		const config = {
			subGenConf: true as const,
			react: { component: createGen("react") },
		} as unknown as GeneratorsSubConfig;
		const cli = makeCli({ dirs: {}, config: {} });

		const result = await findGenerators({ cli, config });

		expect(cli.setDirs).not.toHaveBeenCalled();
		expect(typeof result.component).toBe("function");
	});

	it("should prompt if typeGen is invalid by file", async () => {
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "angular",
		});
		const config = {
			subGenConf: true as const,
			react: { component: createGen("react") },
			vue: { component: createGen("vue") },
		} as unknown as GeneratorsSubConfig;

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["gen"],
			setup: ({ program, processTerm }) => {
				program.command("gen").action(async () => {
					const cli = makeCli({
						processTerm,
						dirs: { [ROOTS.PARENT]: "/project" },
					});
					const selected = await findGenerators({ cli, config });
					processTerm.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Selected: component");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Type Generator angular isn't in the list")).toBeInTerm();
		expect(stdout.getInFirst("Please choose a valid type of generator")).toBeInTerm();
		expect(stdout.getInLast("Selected: component")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should skip reading parentConfig when file does not exist", async () => {
		MockExistsSync.mockReturnValue(false);
		const config = {
			subGenConf: true as const,
			cli: { component: createGen("component") },
		} as unknown as GeneratorsSubConfig;

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["cmd"],
			setup: ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					const cli = makeCli({
						processTerm,
						dirs: { [ROOTS.PARENT]: "/project" },
						config: { configFile: "config", configFileExt: "js" },
					});
					const result = await findGenerators({ cli, config });
					expect(typeof result.component).toBe("function");
					processTerm.exit(0);
				});
			},
		});

		user.type("cli");
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Please choose a type of generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
