import { render } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import { describe, expect, it } from "vitest";
import LogMessageError from "./LogMessageError";

const renderError = (error: Error) =>
	render({
		argv: ["err"],
		setup: ({ program, processTerm }) => {
			program.command("err").action(() => {
				const { unmount } = inkRender(<LogMessageError error={error} />, {
					stdout: processTerm.stdout,
					stdin: processTerm.stdin,
					patchConsole: false,
				});
				unmount();
				processTerm.exit(0);
			});
		},
	});

describe("LogMessageError component", () => {
	it("renders the error name", async () => {
		const { stdout, exitCode } = await renderError(
			new TypeError("something went wrong"),
		);

		expect(stdout.getInLast("TypeError")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders the error message", async () => {
		const { stdout, exitCode } = await renderError(
			new Error("something went wrong"),
		);

		expect(stdout.getInLast("something went wrong")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders both name and message for custom errors", async () => {
		const error = new RangeError("out of bounds");
		const { stdout, exitCode } = await renderError(error);

		expect(stdout.getInLast("RangeError")).toBeInTerm();
		expect(stdout.getInLast("out of bounds")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
