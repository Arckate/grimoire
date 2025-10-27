import type { Matcher } from "../entities/Matcher";
import { cleanAnsi } from "../utils/cleanAnsi";
import { normalizeTerm } from "./normalizeTerm";

export const inLast: Matcher<string> = (term, pattern) => {
	let lastTerm = term;
	if (term.length) {
		lastTerm = [term[term.length - 1]];
	}
	const lines = normalizeTerm(lastTerm);
	const matches = lines.filter((line) => {
		const cleaned = cleanAnsi(line, pattern);
		return typeof pattern === "string"
			? cleaned.includes(pattern)
			: pattern.test(cleaned);
	});

	const errorMessage = [
		`No match for "${pattern}"`,
		"\n",
		term.join("\n"),
	].join("\n");
	return { result: matches, errorMessage };
};
