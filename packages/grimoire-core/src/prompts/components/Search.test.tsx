import { render, userEvent } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import Search from "./Search";

type SearchItem = { label: string; value: string; description?: string };
type SearchProps = ComponentProps<typeof Search>;

const fruits: SearchItem[] = [
	{ label: "apple", value: "apple" },
	{ label: "banana", value: "banana" },
	{ label: "cherry", value: "cherry" },
];

const generators: SearchItem[] = [
	{ label: "api", value: "api", description: "RESTful API generator" },
	{ label: "cli", value: "cli", description: "Command-line tool generator" },
];

const renderStatic = (
	props: Omit<SearchProps, "onSubmit" | "isExited">,
) =>
	render({
		argv: ["search"],
		setup: ({ program, processTerm }) => {
			program.command("search").action(() => {
				const { unmount } = inkRender(
					<Search {...props} onSubmit={() => {}} />,
					{
						stdout: processTerm.stdout,
						stdin: processTerm.stdin,
						patchConsole: false,
					},
				);
				unmount();
				processTerm.exit(0);
			});
		},
	});

const renderSearch = (
	props: Omit<SearchProps, "onSubmit" | "isExited">,
	user?: ReturnType<typeof userEvent>,
) =>
	render({
		user,
		argv: ["search"],
		setup: ({ program, processTerm }) => {
			program.command("search").action(async () => {
				await new Promise<void>((resolve) => {
					inkRender(
						<Search
							{...props}
							onSubmit={() => {
								processTerm.exit(0);
								resolve();
							}}
							isExited
						/>,
						{
							stdout: processTerm.stdout,
							stdin: processTerm.stdin,
							interactive: true,
							patchConsole: false,
						},
					);
				});
			});
		},
	});

describe("Search component", () => {
	// ── Base rendering ───────────────────────────────────────────────────────

	it("renders the message when isValidSelectedValue is false", async () => {
		const { stdout, exitCode } = await renderStatic({
			message: "Choose an item",
			list: fruits,
			isValidSelectedValue: false,
			invalid: {},
		});

		expect(stdout.getInLast("Choose an item")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders items from the list", async () => {
		const { stdout, exitCode } = await renderStatic({
			message: "Choose",
			list: fruits,
		});

		expect(stdout.getInLast("apple")).toBeInTerm();
		expect(stdout.getInLast("banana")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows item description in dim", async () => {
		const { stdout, exitCode } = await renderStatic({
			message: "Choose",
			list: generators,
		});

		expect(stdout.getInLast("RESTful API generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	// ── Filter / no results ──────────────────────────────────────────────────

	it("shows no results when filter matches nothing", async () => {
		const user = userEvent();
		const renderPromise = renderSearch({ message: "Choose", list: fruits }, user);

		user.type("xyz");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("No results found")).toBeInTerm();
		expect(exitCode).toBe(990);
	});

	// ── Submission (ReturnMessage) ───────────────────────────────────────────

	it("shows ✔ icon by default after submission", async () => {
		const user = userEvent();
		const renderPromise = renderSearch({ message: "Choose", list: fruits }, user);

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("✔")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows down.prefix after submission", async () => {
		const user = userEvent();
		const renderPromise = renderSearch(
			{ message: "Choose", list: fruits, down: { prefix: "You selected" } },
			user,
		);

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("You selected")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows down.icon after submission", async () => {
		const user = userEvent();
		const renderPromise = renderSearch(
			{ message: "Choose", list: fruits, down: { icon: "✦" } },
			user,
		);

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("✦")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows down.suffix after submission", async () => {
		const user = userEvent();
		const renderPromise = renderSearch(
			{ message: "Choose", list: fruits, down: { suffix: "(done)" } },
			user,
		);

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("(done)")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows selected value after arrow navigation", async () => {
		const user = userEvent();
		const renderPromise = renderSearch({ message: "Choose", list: fruits }, user);

		user.arrowDown();
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("banana")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	// ── Pre-selected state (selectedValue + isValidSelectedValue) ───────────

	it("shows ReturnMessage immediately when selectedValue is valid", async () => {
		const { stdout, exitCode } = await renderSearch({
			message: "Choose",
			list: fruits,
			selectedValue: "apple",
			isValidSelectedValue: true,
		});

		expect(stdout.getInLast("apple")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	// ── Invalid state (InvalidMessage) ──────────────────────────────────────

	it("shows InvalidMessage when selectedValue is invalid", async () => {
		const { stdout, exitCode } = await renderStatic({
			message: "Choose",
			list: fruits,
			selectedValue: "angular",
			isValidSelectedValue: false,
			invalid: { prefix: "Not found:" },
		});

		expect(stdout.getInLast("angular")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows ⚠ icon by default in InvalidMessage", async () => {
		const { stdout, exitCode } = await renderStatic({
			message: "Choose",
			list: fruits,
			selectedValue: "angular",
			isValidSelectedValue: false,
			invalid: {},
		});

		expect(stdout.getInLast("⚠")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows invalid.icon in InvalidMessage", async () => {
		const { stdout, exitCode } = await renderStatic({
			message: "Choose",
			list: fruits,
			selectedValue: "angular",
			isValidSelectedValue: false,
			invalid: { icon: "✖" },
		});

		expect(stdout.getInLast("✖")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows invalid.message as prompt message when selectedValue is invalid", async () => {
		const { stdout, exitCode } = await renderStatic({
			message: "Choose",
			list: fruits,
			selectedValue: "angular",
			isValidSelectedValue: false,
			invalid: { message: "Please retry" },
		});

		expect(stdout.getInLast("Please retry")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	// ── Custom indicator ─────────────────────────────────────────────────────

	it("shows custom indicator icon", async () => {
		const { stdout, exitCode } = await renderStatic({
			message: "Choose",
			list: fruits,
			indicator: { icon: "→" },
		});

		expect(stdout.getInLast("→")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
