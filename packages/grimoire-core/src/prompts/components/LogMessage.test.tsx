import { render } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import { describe, expect, it } from "vitest";
import LogMessage from "./LogMessage";

const renderLog = (args: (string | object)[]) =>
	render({
		argv: ["log"],
		setup: ({ program, processTerm }) => {
			program.command("log").action(() => {
				const { unmount } = inkRender(<LogMessage args={args} />, {
					stdout: processTerm.stdout,
					stdin: processTerm.stdin,
					patchConsole: false,
				});
				unmount();
				processTerm.exit(0);
			});
		},
	});

describe("LogMessage component", () => {
	it("renders a string arg", async () => {
		const { stdout, exitCode } = await renderLog(["hello world"]);

		expect(stdout.getInLast("hello world")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders an object arg as JSON", async () => {
		const { stdout, exitCode } = await renderLog([{ key: "value" }]);

		expect(stdout.getInLast("key")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("joins multiple args with a space", async () => {
		const { stdout, exitCode } = await renderLog(["foo", "bar"]);

		expect(stdout.getInLast("foo bar")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
