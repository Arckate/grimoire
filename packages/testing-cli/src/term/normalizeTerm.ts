export const normalizeTerm = (term: string[]): string[] => {
	const raw = Array.isArray(term) ? term.join("\n") : term;
	return raw
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
};
