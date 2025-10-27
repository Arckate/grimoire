import { render } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { spinnerPrompt } from "./spinnerPrompt";

describe("spinnerPrompt", () => {
	it("renders the default text 'Loading'", async () => {
		const { stdout, exitCode } = await render({
			argv: ["spin"],
			setup: ({ program, processTerm }) => {
				program.command("spin").action(async () => {
					const { stop } = await spinnerPrompt({ message: "", keyValue: "", config: {}, processTerm });
					stop();
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("Loading")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders a custom text", async () => {
		const { stdout, exitCode } = await render({
			argv: ["spin"],
			setup: ({ program, processTerm }) => {
				program.command("spin").action(async () => {
					const { stop } = await spinnerPrompt({ message: "", keyValue: "", config: { text: "Processing" }, processTerm });
					stop();
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("Processing")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("returns a stop function that can be called without error", async () => {
		const { exitCode } = await render({
			argv: ["spin"],
			setup: ({ program, processTerm }) => {
				program.command("spin").action(async () => {
					const { stop } = await spinnerPrompt({ message: "", keyValue: "", config: {}, processTerm });
					stop();
					processTerm.exit(0);
				});
			},
		});

		expect(exitCode).toBe(0);
	});

	it("stop can be called multiple times without error", async () => {
		const { exitCode } = await render({
			argv: ["spin"],
			setup: ({ program, processTerm }) => {
				program.command("spin").action(async () => {
					const { stop } = await spinnerPrompt({ message: "", keyValue: "", config: {}, processTerm });
					stop();
					stop();
					processTerm.exit(0);
				});
			},
		});

		expect(exitCode).toBe(0);
	});
});
