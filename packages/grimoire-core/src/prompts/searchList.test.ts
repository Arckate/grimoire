import { render, userEvent } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { searchList } from "./searchList";

describe("searchList", () => {
	it("should display the search prompt message", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await render({
			argv: ["search"],
			setup: ({ program, processTerm }) => {
				program.command("search").action(async () => {
					await searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
						processTerm,
					});
				});
			},
		});

		// Assert
		const question = stdout.getInLast("Choose a fruit");
		expect(question).toBeInTerm();
		expect(exitCode).toBe(990);
	});

	it("should display the search prompt message with search value", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["search"],
			setup: ({ program, processTerm }) => {
				program.command("search").action(async () => {
					await searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
						processTerm,
					});
				});
			},
		});

		// Act
		user.type("banana");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const questionWithValue = stdout.getInLast("Choose a fruit banana");
		expect(questionWithValue).toBeInTerm();
		expect(exitCode).toBe(990);
	});

	it("should display the selected prompt message", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["search"],
			setup: ({ program, processTerm }) => {
				program.command("search").action(async () => {
					await searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
						processTerm,
					});
				});
			},
		});

		// Act
		user.pressEnter();
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const valueReturn = stdout.getInLast("You use type apple");
		expect(valueReturn).toBeInTerm();
		expect(exitCode).toBe(990);
	});

	it("should simulate select second element", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["search"],
			setup: ({ program, processTerm }) => {
				program.command("search").action(async () => {
					const selected = await searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
						processTerm,
					});
					processTerm.stdout.write(`Select: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Select: banana");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const valueReturn = stdout.getInLast("Select: banana");
		expect(valueReturn).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should simulate search element by full name", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["search"],
			setup: ({ program, processTerm, debug }) => {
				program.command("search").action(async () => {
					try {
						const selected = await searchList({
							message: "Choose a fruit",
							list: ["apple", "banana", "cherry"],
							processTerm,
						});
						processTerm.stdout.write(`Search: ${selected}\n`);
						processTerm.exit(0);
					} catch (error) {
						debug({ args: ["error searchList", error] });
					}
				});
			},
		});

		// Act
		user.type("banana");
		user.pressEnter();
		user.waitWrite("Search: banana");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const valueReturn = stdout.getInLast("✦ You use type banana");
		expect(valueReturn).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should simulate search element by partial information", async () => {
		// Arrange
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["search"],
			setup: ({ program, processTerm }) => {
				program.command("search").action(async () => {
					const selected = await searchList({
						message: "Choose a fruit",
						list: ["apple", "banana", "cherry"],
						processTerm,
					});
					processTerm.stdout.write(`Search: ${selected}\n`);
					processTerm.exit(0);
				});
			},
		});

		// Act
		user.type("a");
		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Search: banana");
		const { stdout, exitCode } = await renderPromise;

		// Assert
		const valueReturn = stdout.getInLast("✦ You use type banana");
		expect(valueReturn).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
