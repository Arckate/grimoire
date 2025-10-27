import { render, userEvent } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import { describe, expect, it } from "vitest";
import Input from "./Input";

const renderInput = (
	props: { message: string; prefixDone?: string },
	user?: ReturnType<typeof userEvent>,
) =>
	render({
		user,
		argv: ["ask"],
		setup: ({ program, processTerm }) => {
			program.command("ask").action(async () => {
				await new Promise<void>((resolve) => {
					inkRender(
						<Input
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

describe("Input component", () => {
	it("renders the message", async () => {
		const { stdout, exitCode } = await render({
			argv: ["ask"],
			setup: ({ program, processTerm }) => {
				program.command("ask").action(() => {
					const { unmount } = inkRender(
						<Input message="Enter a value" onSubmit={() => {}} />,
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

		expect(stdout.getInLast("Enter a value")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows ✔ prefix in submitted state by default", async () => {
		const user = userEvent();
		const renderPromise = renderInput({ message: "Enter a value" }, user);

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("✔")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows custom prefix in submitted state", async () => {
		const user = userEvent();
		const renderPromise = renderInput(
			{ message: "Enter a value", prefixDone: "✦" },
			user,
		);

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("✦")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows the typed value in submitted state", async () => {
		const user = userEvent();
		const renderPromise = renderInput({ message: "Enter a value" }, user);

		user.type("hello");
		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("hello")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
