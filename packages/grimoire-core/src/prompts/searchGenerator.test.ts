import { render, userEvent } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { searchGenerator } from "./searchGenerator";

const generatorList = [
	{ name: "api", description: "RESTful API generator" },
	{ name: "cli", description: "Command-line tool generator" },
	{ name: "web", description: "Frontend web app generator" },
];

describe("searchGenerator", () => {
	it("should display the generator prompt message", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await render({
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
				});
			},
		});

		// Assert
		const question = stdout.getInLast("Choose a generator");
		expect(question).toBeInTerm();
		expect(exitCode).toBe(990);
	});

	it("should search and select 'cli' generator by full name", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.type("cli");
		user.pressEnter();
		user.waitWrite("Selected: cli");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const resultPrompt = stdout.getInLast("✦ You use generator cli");
		expect(resultPrompt).toBeInTerm();
		const resultSelected = stdout.getInLast("Selected: cli");
		expect(resultSelected).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should search and select 'cli' generator by partial input", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
					processTerm.stdout.write(`Search: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.type("cli");
		user.pressEnter();
		user.waitWrite("Selected: cli");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const resultPrompt = stdout.getInLast("You use generator cli");
		expect(resultPrompt).toBeInTerm();
		const resultSelected = stdout.getInLast("Search: cli");
		expect(resultSelected).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should select default generator when pressing enter immediately", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
					processTerm.stdout.write(`Search: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.pressEnter();
		user.waitWrite("Search: api");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const resultPrompt = stdout.getInLast("You use generator api");
		expect(resultPrompt).toBeInTerm();
		const resultSelected = stdout.getInLast("Search: api");
		expect(resultSelected).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should select 'web' generator using arrow navigation", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGenerator({
						message: "Choose a generator",
						generatorList,
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.arrowDown();
		user.arrowDown();
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const resultPrompt = stdout.getInLast("You use generator web");
		expect(resultPrompt).toBeInTerm();
		const resultSelected = stdout.getInLast("Selected: web");
		expect(resultSelected).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
