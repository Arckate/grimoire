import { render } from "@arckate/testing-cli";
import { describe, expect, it } from "vitest";
import { removeLine } from "./removeLine";

describe("removeLine CLI", () => {
	it("should call removeLine and simulate line removal", async () => {
		// Arrange/Act
		const { stdout, exitCode } = await render({
			argv: ["clear"],
			setup: ({ program, processTerm }) => {
				program.command("clear").action(() => {
					processTerm.stdout.write("Line 1\n");
					processTerm.stdout.write("Line 2\n");
					processTerm.stdout.write("Line 3\n");

					removeLine({ processTerm, nb: 2 });

					processTerm.stdout.write("After clear\n");
					processTerm.exit(0);
				});
			},
		});

		// Assert
		const line1 = stdout.getInLast("Line 1");
		expect(line1).toBeInTerm();
		const line2 = stdout.queryInLast("Line 2");
		expect(line2).not.toBeInTerm();
		const AfterClear = stdout.getInLast("After clear");
		expect(AfterClear).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
