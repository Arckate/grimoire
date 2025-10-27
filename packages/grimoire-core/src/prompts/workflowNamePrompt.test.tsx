import { render, userEvent } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { workflowNamePrompt } from "./workflowNamePrompt";

const workflowList = ["alpha", "beta", "gamma"];

describe("workflowNamePrompt", () => {
	it("resolves with the first item on Enter", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["wf"],
			setup: ({ program, processTerm }) => {
				program.command("wf").action(async () => {
					const selected = await workflowNamePrompt({
						message: "Please choose a workflow",
						keyValue: "workflow",
						config: { isValid: false, list: workflowList },
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected.workflow}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitWrite("Selected: alpha");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("Selected: alpha")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("resolves with item found by typing", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["wf"],
			setup: ({ program, processTerm }) => {
				program.command("wf").action(async () => {
					const selected = await workflowNamePrompt({
						message: "Please choose a workflow",
						keyValue: "workflow",
						config: { isValid: false, list: workflowList },
						processTerm,
					});
					processTerm.stdout.write(`Selected: ${selected.workflow}\n`);
					processTerm.exit(0);
				});
			},
		});

		user.type("beta");
		user.pressEnter();
		user.waitWrite("Selected: beta");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("Selected: beta")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows the prompt message", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["wf"],
			setup: ({ program, processTerm }) => {
				program.command("wf").action(async () => {
					await workflowNamePrompt({
						message: "Please choose a workflow",
						keyValue: "workflow",
						config: { isValid: false, list: workflowList },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Please choose a workflow")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows invalid message when workflowName is not in list", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["wf"],
			setup: ({ program, processTerm }) => {
				program.command("wf").action(async () => {
					await workflowNamePrompt({
						message: "Please choose a workflow",
						keyValue: "workflow",
						config: { isValid: false, list: workflowList },
						defaultValue: "unknown",
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Workflowunknownisn't in the list")).toBeInTerm();
		expect(stdout.getInFirst("Please choose a valid workflow")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows 'You use workflow' after selection", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["wf"],
			setup: ({ program, processTerm }) => {
				program.command("wf").action(async () => {
					await workflowNamePrompt({
						message: "Please choose a workflow",
						keyValue: "workflow",
						config: { isValid: false, list: workflowList },
						processTerm,
					});
					processTerm.exit(0);
				});
			},
		});

		user.pressEnter();
		user.waitExit(0);
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInLast("You use workflow")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
