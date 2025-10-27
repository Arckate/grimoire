import { render } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import { describe, expect, it } from "vitest";
import Spinner from "./Spinner";

const renderSpinner = (props: React.ComponentProps<typeof Spinner> = {}) =>
	render({
		argv: ["spin"],
		setup: ({ program, processTerm }) => {
			program.command("spin").action(() => {
				const { unmount } = inkRender(<Spinner {...props} />, {
					stdout: processTerm.stdout,
					patchConsole: false,
				});
				unmount();
				processTerm.exit(0);
			});
		},
	});

describe("Spinner component", () => {
	it("renders the default text 'Loading'", async () => {
		const { stdout, exitCode } = await renderSpinner();

		expect(stdout.getInLast("Loading")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders a custom text", async () => {
		const { stdout, exitCode } = await renderSpinner({ text: "Processing" });

		expect(stdout.getInLast("Processing")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders a spinner character", async () => {
		const { stdout, exitCode } = await renderSpinner();

		expect(stdout.getInLast("⠋")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
