import { render } from "@arckate/testing-cli";
import chalk from "chalk";
import { describe, expect, it } from "vitest";
import { loggerErrorPrompt, loggerPrompt } from "./loggerPrompt";

describe("loggerPrompt", () => {
	it("should print a simple message", async () => {
		const { stdout, exitCode } = await render({
			argv: ["log"],
			setup: ({ program, processTerm }) => {
				program.command("log").action(() => {
					loggerPrompt({ message: "", keyValue: "", config: { args: ["Hello world"] }, processTerm });
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("Hello world")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should format an object as JSON", async () => {
		const { stdout, exitCode } = await render({
			argv: ["json"],
			setup: ({ program, processTerm }) => {
				program.command("json").action(() => {
					loggerPrompt({
						message: "",
						keyValue: "",
						config: { args: [{ name: "Charles", active: true }] },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast('"name": "Charles"')).toBeInTerm();
		expect(stdout.getInLast('"active": true')).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should print multiple mixed args", async () => {
		const { stdout, exitCode } = await render({
			argv: ["mixed"],
			setup: ({ program, processTerm }) => {
				program.command("mixed").action(() => {
					loggerPrompt({ message: "", keyValue: "", config: { args: ["label", { x: 1 }] }, processTerm });
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("label")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});

describe("loggerErrorPrompt", () => {
	it("should display the error name and message", async () => {
		const { stdout, exitCode } = await render({
			argv: ["fail"],
			setup: ({ program, processTerm }) => {
				program.command("fail").action(() => {
					loggerErrorPrompt({
						message: "",
						keyValue: "",
						config: { error: new Error("Something went wrong") },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("Error")).toBeInTerm();
		expect(stdout.getInLast("Something went wrong")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should display error name with red background", async () => {
		const { stdout, exitCode } = await render({
			argv: ["fail"],
			setup: ({ program, processTerm }) => {
				program.command("fail").action(() => {
					loggerErrorPrompt({
						message: "",
						keyValue: "",
						config: { error: new Error("Something went wrong") },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast(chalk.bold.bgRed("Error"))).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
