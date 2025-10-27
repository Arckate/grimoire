import { render, userEvent } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { input } from "./input";

describe("input", () => {
	it("should display the input prompt message", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await render({
			argv: ["ask"],
			setup: ({ program, processTerm }) => {
				program.command("ask").action(async () => {
					await input({
						message: "Please write a value",
						processTerm,
					});
				});
			},
		});

		// Assert
		const question = stdout.getInLast("Please write a value");
		expect(question).toBeInTerm();
		expect(exitCode).toBe(990);
	});

	it("should display the input prompt message with typed value", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["ask"],
			setup: ({ program, processTerm }) => {
				program.command("ask").action(async () => {
					const value = await input({
						message: "Please write a value",
						processTerm,
					});
					processTerm.stdout.write(`You typed: ${value}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.waitWrite("Please write a value");
		user.type("hello");
		user.pressEnter();
		user.waitWrite("You typed: hello");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const valueReturn = stdout.getInLast("You typed: hello");
		expect(valueReturn).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should handle empty input gracefully", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["ask"],
			setup: ({ program, processTerm }) => {
				program.command("ask").action(async () => {
					const value = await input({
						message: "Please write a value",
						processTerm,
					});
					processTerm.stdout.write(`You typed: ${value}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.pressEnter();
		user.waitWrite("You typed: ");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const valueReturn = stdout.getInLast("You typed:");
		expect(valueReturn).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
