import { formatError, render, userEvent } from "@arckate/testing-cli";
import chalk from "chalk";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cmdPlop } from "./cmdPlop";

const MockRunActions = vi.fn();
const MockRunPrompts = vi.fn();
const MockPrompts = [
	{ name: "name", type: "input", message: "Your name?" },
	{ name: "age", type: "input", message: "Your age?" },
];
const MockSetDefaultInclude = vi.fn();

vi.mock("node-plop", () => {
	return {
		default: () => ({
			getGeneratorList: () => [
				{ name: "api", description: "RESTful API generator" },
				{ name: "cli", description: "Command-line tool generator" },
				{ name: "web", description: "Frontend web app generator" },
			],
			getGenerator: () => ({
				prompts: MockPrompts,
				runPrompts: MockRunPrompts,
				runActions: MockRunActions,
			}),
			setDefaultInclude: (params: any) => MockSetDefaultInclude(params),
		}),
	};
});

describe("cmdPlop", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetModules();
	});
	it("should prompt for generator and select 'cli' via full input", async () => {
		// Arrange
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["cmd"],
			setup: async ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["unknown", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
							processTerm,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Act
		user.type("cli");
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const questionBeforeType = stdout.getInFirst(
			"Please choose a valid generator",
		);
		expect(questionBeforeType).toBeInTerm();
		const question = stdout.getInAll("Please choose a valid generator cli");
		expect(question).toBeInTerm();
		const resultCmd = stdout.getInLast("You use generator cli");
		expect(resultCmd).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should select default generator when pressing enter immediately", async () => {
		// Arrange
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["cmd"],
			setup: async ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
							processTerm,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Act
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		// Assert

		const question = stdout.getInFirst("Please choose a generator");
		expect(question).toBeInTerm();
		const resultCmd = stdout.getInLast("You use generator api");
		expect(resultCmd).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should run generator and log changes and failures", async () => {
		// Arrange/ Act
		MockRunPrompts.mockResolvedValue({ name: "Alice", age: "30" });
		MockRunActions.mockReturnValue({
			changes: [{ type: "add", path: "src/index.ts" }],
			failures: [{ type: "error", error: "Oops!" }],
		});

		const { stdout, exitCode } = await render({
			argv: ["cmd"],
			setup: ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["cli", { name: "Alice", age: "30" }],
							configPath: "./plopfile.js",
							processTerm,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert

		const resultCmd = stdout.getInLast("You use generator cli");
		expect(resultCmd).toBeInTerm();
		const resultValid = stdout.getInLast(
			`${chalk.green("✔")} ${chalk.blueBright.bold.italic(`[add]`)} src/index.ts`,
		);
		expect(resultValid).toBeInTerm();
		const resultError = stdout.getInLast(
			`${chalk.red("✖")} ${chalk.blueBright.bold.italic(`[error]`)} Oops!`,
		);
		expect(resultError).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should skip prompts when ignorePrompts is true and use provided args directly", async () => {
		// Arrange/Acts
		MockRunPrompts.mockResolvedValue({});
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const providedArgs = { name: "Bob", age: "42" };

		const { stdout, exitCode } = await render({
			argv: ["cmd"],
			setup: ({ program, processTerm }) => {
				program.command("cmd").action(async () => {
					try {
						await cmdPlop({
							args: ["cli", providedArgs],
							configPath: "./plopfile.js",
							processTerm,
							ignorePrompts: true,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		const resultCmd = stdout.getInLast("You use generator cli");
		expect(resultCmd).toBeInTerm();
		expect(MockRunPrompts).not.toHaveBeenCalled(); // ✅ pas de prompts
		expect(MockRunActions).toHaveBeenCalledWith(providedArgs); // ✅ args directs
		expect(exitCode).toBe(0);
	});
});
