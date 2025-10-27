export function cleanAnsi(input: string, expected?: string | RegExp): string {
	const ansiRegex = /\u001b\[[0-9;?]*[A-Za-z]/g;

	if (!expected) {
		return input.replace(ansiRegex, "");
	}
	const expectedStr =
		expected instanceof RegExp ? expected.source : expected.toString();

	const allowedAnsi = Array.from(expectedStr.matchAll(ansiRegex), (m) => m[0]);

	return input.replace(ansiRegex, (match) => {
		return allowedAnsi.includes(match) ? match : "";
	});
}
