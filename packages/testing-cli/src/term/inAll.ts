import type { Matcher } from "../entities/Matcher";
import { cleanAnsi } from "../utils/cleanAnsi";
import { normalizeTerm } from "./normalizeTerm";

export const inAll: Matcher<string> = (term, pattern) => {
	const lines = normalizeTerm(term);
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
