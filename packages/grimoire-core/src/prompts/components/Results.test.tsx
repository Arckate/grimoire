import { render } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import { describe, expect, it } from "vitest";
import Results from "./Results";
import type { PromptResultItem } from "./Results";

const renderResults = (items: PromptResultItem[]) =>
	render({
		argv: ["res"],
		setup: ({ program, processTerm }) => {
			program.command("res").action(() => {
				const { unmount } = inkRender(<Results items={items} />, {
					stdout: processTerm.stdout,
					patchConsole: false,
				});
				unmount();
				processTerm.exit(0);
			});
		},
	});

describe("Results component", () => {
	it("renders without error when items is empty", async () => {
		const { exitCode } = await renderResults([]);

		expect(exitCode).toBe(0);
	});

	it("shows ✔ for a valid item", async () => {
		const { stdout, exitCode } = await renderResults([
			{ isValid: true, data: { type: "create", name: "App", value: "App.tsx" } },
		]);

		expect(stdout.getInLast("✔")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows [type] for a valid item", async () => {
		const { stdout, exitCode } = await renderResults([
			{ isValid: true, data: { type: "create", name: "App", value: "App.tsx" } },
		]);

		expect(stdout.getInLast("[create]")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows value when defined for a valid item", async () => {
		const { stdout, exitCode } = await renderResults([
			{ isValid: true, data: { type: "create", name: "App", value: "App.tsx" } },
		]);

		expect(stdout.getInLast("App.tsx")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows name when value is undefined for a valid item", async () => {
		const { stdout, exitCode } = await renderResults([
			{ isValid: true, data: { type: "create", name: "MyClass" } },
		]);

		expect(stdout.getInLast("MyClass")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows ✖ for an invalid item", async () => {
		const { stdout, exitCode } = await renderResults([
			{ isValid: false, data: { message: "file already exists" } },
		]);

		expect(stdout.getInLast("✖")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows error message for an invalid item", async () => {
		const { stdout, exitCode } = await renderResults([
			{ isValid: false, data: { message: "file already exists" } },
		]);

		expect(stdout.getInLast("file already exists")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders multiple mixed items", async () => {
		const { stdout, exitCode } = await renderResults([
			{ isValid: true, data: { type: "create", name: "App", value: "App.tsx" } },
			{ isValid: false, data: { message: "already exists" } },
		]);

		expect(stdout.getInLast("App.tsx")).toBeInTerm();
		expect(stdout.getInLast("already exists")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
