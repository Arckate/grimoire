import { render } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import { describe, expect, it } from "vitest";
import ReturnMessage from "./ReturnMessage";

const renderReturn = (props: React.ComponentProps<typeof ReturnMessage>) =>
	render({
		argv: ["ret"],
		setup: ({ program, processTerm }) => {
			program.command("ret").action(() => {
				const { unmount } = inkRender(<ReturnMessage {...props} />, {
					stdout: processTerm.stdout,
					patchConsole: false,
				});
				unmount();
				processTerm.exit(0);
			});
		},
	});

describe("ReturnMessage component", () => {
	it("shows ✔ by default when no icon is provided", async () => {
		const { stdout, exitCode } = await renderReturn({ value: "my-app" });

		expect(stdout.getInLast("✔")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("shows custom icon", async () => {
		const { stdout, exitCode } = await renderReturn({ value: "my-app", icon: "✦" });

		expect(stdout.getInLast("✦")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders the value", async () => {
		const { stdout, exitCode } = await renderReturn({ value: "my-app" });

		expect(stdout.getInLast("my-app")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders prefix when provided", async () => {
		const { stdout, exitCode } = await renderReturn({ value: "my-app", prefix: "You chose" });

		expect(stdout.getInLast("You chose")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("renders suffix when provided", async () => {
		const { stdout, exitCode } = await renderReturn({ value: "my-app", suffix: "(done)" });

		expect(stdout.getInLast("(done)")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("highlights query within the value", async () => {
		const { stdout, exitCode } = await renderReturn({ value: "my-app", query: "app" });

		expect(stdout.getInLast("app")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
