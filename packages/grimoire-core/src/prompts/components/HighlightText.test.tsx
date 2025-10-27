import { render } from "@arckate/testing-cli";
import { render as inkRender } from "ink";
import { describe, expect, it } from "vitest";
import { HighlightText } from "./HighlightText";

const renderHighlight = (text: string, word: string) =>
	render({
		argv: ["show"],
		setup: ({ program, processTerm }) => {
			program.command("show").action(() => {
				const { unmount } = inkRender(
					<HighlightText text={text} word={word} />,
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

describe("HighlightText", () => {
	it("highlights a single word in the text", async () => {
		const { stdout, exitCode } = await renderHighlight(
			"The sky is blue",
			"blue",
		);

		expect(stdout.getInLast("blue")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("highlights multiple occurrences of the word", async () => {
		const { stdout, exitCode } = await renderHighlight("Blue is blue", "blue");

		expect(stdout.getInLast("Blue is blue")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("is case-insensitive", async () => {
		const { stdout, exitCode } = await renderHighlight(
			"The Sky Is BLUE",
			"blue",
		);

		expect(stdout.getInLast("BLUE")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("returns original text if word is not found", async () => {
		const { stdout, exitCode } = await renderHighlight(
			"The sky is blue",
			"green",
		);

		expect(stdout.getInLast("The sky is blue")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("returns original text if word is empty", async () => {
		const { stdout, exitCode } = await renderHighlight("The sky is blue", "");

		expect(stdout.getInLast("The sky is blue")).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("handles special characters in the word", async () => {
		const { stdout, exitCode } = await renderHighlight("Price is 100€", "100€");

		expect(stdout.getInLast("100€")).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
