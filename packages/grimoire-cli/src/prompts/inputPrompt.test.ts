import { render, userEvent } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { inputPrompt } from "./inputPrompt";

describe("inputPrompt", () => {
	it("resolves with the typed value", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["ask"],
			setup: ({ program, processTerm }) => {
				program.command("ask").action(async () => {
					const value = await inputPrompt({
						message: "Please write a value",
						processTerm,
					});
					processTerm.stdout.write(`You typed: ${value}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.waitWrite("Please write a value");
		user.type("hello");
		user.pressEnter();
		user.waitWrite("You typed: hello");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("You typed: hello")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("resolves with empty string when nothing is typed", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["ask"],
			setup: ({ program, processTerm }) => {
				program.command("ask").action(async () => {
					const value = await inputPrompt({
						message: "Please write a value",
						processTerm,
					});
					processTerm.stdout.write(`You typed: ${value}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitWrite("You typed: ");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("You typed:")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
