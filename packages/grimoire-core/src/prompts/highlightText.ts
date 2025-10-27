import chalk from "chalk";

export const highlightText = (text: string, word: string) => {
	if (word) {
		const regex = new RegExp(`(${word})`, "gi");
		return text.replace(regex, chalk.bold("$1"));
	}
	return text;
};
