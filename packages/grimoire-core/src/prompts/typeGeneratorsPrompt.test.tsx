import { render, userEvent } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { typeGeneratorsPrompt } from "./typeGeneratorsPrompt";

const typeGenList = ["react", "vue", "angular"];

describe("typeGeneratorsPrompt", () => {
	it("resolves with the first item on Enter", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["tg"],
			setup: ({ program, processTerm }) => {
				program.command("tg").action(async () => {
					const selected = await typeGeneratorsPrompt({
						message: "Please choose a type of generator",
						keyValue: "typeGen",
						config: { isValid: false, list: typeGenList },
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected.typeGen}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitWrite("Selected: react");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("Selected: react")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("resolves with item found by typing", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["tg"],
			setup: ({ program, processTerm }) => {
				program.command("tg").action(async () => {
					const selected = await typeGeneratorsPrompt({
						message: "Please choose a type of generator",
						keyValue: "typeGen",
						config: { isValid: false, list: typeGenList },
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected.typeGen}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.type("vue");
		user.pressEnter();
		user.waitWrite("Selected: vue");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("Selected: vue")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows the prompt message", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["tg"],
			setup: ({ program, processTerm }) => {
				program.command("tg").action(async () => {
					await typeGeneratorsPrompt({
						message: "Please choose a type of generator",
						keyValue: "typeGen",
						config: { isValid: false, list: typeGenList },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Please choose a type of generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows invalid message when typeGenName is not in list", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["tg"],
			setup: ({ program, processTerm }) => {
				program.command("tg").action(async () => {
					await typeGeneratorsPrompt({
						message: "Please choose a type of generator",
						keyValue: "typeGen",
						config: { isValid: false, list: typeGenList },
						defaultValue: "svelte",
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Type Generator svelte isn't in the list")).toBeInTerm();
		expect(stdout.getInFirst("Please choose a valid type of generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows 'You use type generator' after selection", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["tg"],
			setup: ({ program, processTerm }) => {
				program.command("tg").action(async () => {
					await typeGeneratorsPrompt({
						message: "Please choose a type of generator",
						keyValue: "typeGen",
						config: { isValid: false, list: typeGenList },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("You use type generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
