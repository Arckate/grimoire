import { render, userEvent } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { searchGeneratorPrompt } from "./searchGeneratorPrompt";

const generatorList = [
	{ name: "api", description: "RESTful API generator" },
	{ name: "cli", description: "Command-line tool generator" },
	{ name: "web", description: "Frontend web app generator" },
];

describe("searchGeneratorPrompt", () => {
	it("resolves with the first item on Enter", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGeneratorPrompt({
						message: "Please choose a generator",
						keyValue: "generator",
						config: { isValid: false, list: generatorList },
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected.generator}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("Selected: api")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("resolves with item found by typing", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGeneratorPrompt({
						message: "Please choose a generator",
						keyValue: "generator",
						config: { isValid: false, list: generatorList },
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected.generator}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.type("cli");
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("Selected: cli")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("resolves with item selected via arrow navigation", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					const selected = await searchGeneratorPrompt({
						message: "Please choose a generator",
						keyValue: "generator",
						config: { isValid: false, list: generatorList },
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected.generator}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.arrowDown();
		user.arrowDown();
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("Selected: web")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows generator descriptions", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					await searchGeneratorPrompt({
						message: "Please choose a generator",
						keyValue: "generator",
						config: { isValid: false, list: generatorList },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("RESTful API generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows invalid message when generatorName is not in list", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					await searchGeneratorPrompt({
						message: "Please choose a generator",
						keyValue: "generator",
						config: { isValid: false, list: generatorList },
						defaultValue: "unknown",
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Generator unknown isn't in the list")).toBeInTerm();
		expect(stdout.getInFirst("Please choose a valid generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows 'You use generator' after selection", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["generate"],
			setup: ({ program, processTerm }) => {
				program.command("generate").action(async () => {
					await searchGeneratorPrompt({
						message: "Please choose a generator",
						keyValue: "generator",
						config: { isValid: false, list: generatorList },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("You use generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
