import { render } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { removeLinePrompt } from "./removeLinePrompt";

describe("removeLinePrompt", () => {
	it("should call removeLinePrompt and simulate line removal", async () => {
		const { stdout, exitCode } = await render({
			argv: ["clear"],
			setup: ({ program, processTerm }) => {
				program.command("clear").action(() => {
					processTerm.stdout.write("Line 1\n");
					processTerm.stdout.write("Line 2\n");
					processTerm.stdout.write("Line 3\n");

					removeLinePrompt({ message: "", keyValue: "", config: { nb: 2 }, processTerm });

					processTerm.stdout.write("After clear\n");
					processTerm.exit(0);
				});
			},
		});

		expect(stdout.getInLast("Line 1")).toBeInTerm();
		expect(stdout.queryInLast("Line 2")).not.toBeInTerm();
		expect(stdout.getInLast("After clear")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
