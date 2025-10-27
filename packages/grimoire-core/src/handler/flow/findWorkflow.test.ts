import { render, userEvent } from "@arckate/testing-cli";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Cli } from "~/Cli";
import { removeLinePrompt, workflowNamePrompt } from "~/prompts";
import { findWorkflow } from "./findWorkflow";

beforeEach(() => {
	vi.clearAllMocks();
});

describe("findWorkflow", () => {
	const processTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
		cwd: process.cwd,
	};

	const makeCli = (pt = processTerm): Cli =>
		({
			getProcessTerm: () => pt,
			getPrompts: () => ({ cliWorkflowName: workflowNamePrompt, cliRemoveLine: removeLinePrompt }),
		}) as unknown as Cli;

	const workflows = {
		alpha: { step1: { ctorKey: "alpha" } },
		beta: { step1: { ctorKey: "beta" } },
	};

	it("should return workflow directly if name is valid", async () => {
		const result = await findWorkflow({
			cli: makeCli(),
			workflows,
			workflowName: "alpha",
		});

		expect(result).toEqual({ step1: { ctorKey: "alpha" } });
	});

	it("should show invalid message and prompt if workflowName is not in list", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["start"],
			setup: ({ program, processTerm: pt }) => {
				program.command("start").action(async () => {
					const selected = await findWorkflow({
						cli: makeCli(pt),
						workflows,
						workflowName: "gamma",
					});
					pt.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					pt.exit(0);
				});
			},
		});

		user.waitWrite("Please choose a workflow");
		user.type("beta");
		user.pressEnter();
		user.waitWrite("Selected: step1");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Workflowgammaisn't in the list")).toBeInTerm();
		expect(stdout.getInAll("Please choose a valid workflow beta")).toBeInTerm();
		expect(stdout.getInLast("You use workflowbeta")).toBeInTerm();
		expect(stdout.getInLast("Selected: step1")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should prompt when no workflowName is provided", async () => {
		const user = userEvent();
		const renderPromise = render({
			user,
			argv: ["start"],
			setup: ({ program, processTerm: pt }) => {
				program.command("start").action(async () => {
					const selected = await findWorkflow({
						cli: makeCli(pt),
						workflows,
					});
					pt.stdout.write(`Selected: ${Object.keys(selected)[0]}\n`);
					pt.exit(0);
				});
			},
		});

		user.arrowDown();
		user.pressEnter();
		user.waitWrite("Selected: step1");
		const { stdout, exitCode } = await renderPromise;

		expect(stdout.getInFirst("Please choose a workflow")).toBeInTerm();
		expect(stdout.getInLast("Selected: step1")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
