import { render } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { resultPrompt } from "./resultPrompt";

describe("resultPrompt", () => {
	it("renders a valid item and unmounts", async () => {
		const { stdout, exitCode } = await render({
			argv: ["result"],
			setup: ({ program, processTerm }) => {
				program.command("result").action(() => {
					resultPrompt({
						message: "",
						keyValue: "",
						config: {
							items: [
								{ isValid: true, data: { type: "create", name: "App", value: "App.tsx" } },
							],
						},
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("✔")).toBeInTerm();
		expect(stdout.getInLast("App.tsx")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders an invalid item", async () => {
		const { stdout, exitCode } = await render({
			argv: ["result"],
			setup: ({ program, processTerm }) => {
				program.command("result").action(() => {
					resultPrompt({
						message: "",
						keyValue: "",
						config: { items: [{ isValid: false, data: { message: "something failed" } }] },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("✖")).toBeInTerm();
		expect(stdout.getInLast("something failed")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders multiple mixed items", async () => {
		const { stdout, exitCode } = await render({
			argv: ["result"],
			setup: ({ program, processTerm }) => {
				program.command("result").action(() => {
					resultPrompt({
						message: "",
						keyValue: "",
						config: {
							items: [
								{ isValid: true, data: { type: "update", name: "Index", value: "index.ts" } },
								{ isValid: false, data: { message: "permission denied" } },
							],
						},
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("index.ts")).toBeInTerm();
		expect(stdout.getInLast("permission denied")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders an empty list without error", async () => {
		const { exitCode } = await render({
			argv: ["result"],
			setup: ({ program, processTerm }) => {
				program.command("result").action(() => {
					resultPrompt({ message: "", keyValue: "", config: { items: [] }, processTerm });
					processTerm.exit(0);
				});
			},
		});

		expect(exitCode).toBe(0);
	});
});
