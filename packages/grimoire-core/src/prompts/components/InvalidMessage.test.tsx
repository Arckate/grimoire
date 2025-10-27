import { render } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import { describe, expect, it } from "vitest";
import InvalidMessage from "./InvalidMessage";

const renderInvalid = (props: React.ComponentProps<typeof InvalidMessage>) =>
	render({
		argv: ["inv"],
		setup: ({ program, processTerm }) => {
			program.command("inv").action(() => {
				const { unmount } = inkRender(<InvalidMessage {...props} />, {
					stdout: processTerm.stdout,
					patchConsole: false,
				});
				unmount();
				processTerm.exit(0);
			});
		},
	});

describe("InvalidMessage component", () => {
	it("shows ⚠ by default when no icon is provided", async () => {
		const { stdout, exitCode } = await renderInvalid({ value: "angular" });

		expect(stdout.getInLast("⚠")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows custom icon instead of ⚠", async () => {
		const { stdout, exitCode } = await renderInvalid({ value: "angular", icon: "✖" });

		expect(stdout.getInLast("✖")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders the value", async () => {
		const { stdout, exitCode } = await renderInvalid({ value: "unknown-gen" });

		expect(stdout.getInLast("unknown-gen")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders prefix when provided", async () => {
		const { stdout, exitCode } = await renderInvalid({ value: "angular", prefix: "Generator" });

		expect(stdout.getInLast("Generator")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders suffix when provided", async () => {
		const { stdout, exitCode } = await renderInvalid({
			value: "angular",
			suffix: "isn't in the list",
		});

		expect(stdout.getInLast("isn't in the list")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders without prefix or suffix", async () => {
		const { stdout, exitCode } = await renderInvalid({ value: "only-value" });

		expect(stdout.getInLast("only-value")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
