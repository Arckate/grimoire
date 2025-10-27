import { render } from "@arckate/testing-cli";
import chalk from "chalk";
import { describe, expect, it } from "vitest";
import { logError, logger } from "./logger";

describe("CLI logger integration", () => {
	it("should print a simple log message", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await render({
			argv: ["hello"],
			setup: ({ program, processTerm }) => {
				program.command("hello").action(() => {
					logger({ processTerm, args: ["Hello world"] });
					processTerm.exit(0);
				});
			},
		});

		// Assert
		const loggerResult = stdout.getInLast("Hello world");
		expect(loggerResult).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should format and print an object", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await render({
			argv: ["json"],
			setup: ({ program, processTerm }) => {
				program.command("json").action(() => {
					logger({ processTerm, args: [{ name: "Charles", active: true }] });
					processTerm.exit(0);
				});
			},
		});

		// Assert
		const loggerCharles = stdout.getInLast('"name": "Charles"');
		expect(loggerCharles).toBeInTerm();
		const loggerTrue = stdout.getInLast('"active": true');
		expect(loggerTrue).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should print an error with chalk formatting", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await render({
			argv: ["fail"],
			setup: ({ program, processTerm }) => {
				program.command("fail").action(() => {
					logError({ processTerm, error: new Error("Something went wrong") });
					processTerm.exit(0);
				});
			},
		});

		// Assert
		const loggerError = stdout.getInLast(
			`${chalk.bgRed("Error")} ${chalk.red("Something went wrong")}`,
		);
		expect(loggerError).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
