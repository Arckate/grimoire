import { search } from "@inquirer/prompts";
import chalk from "chalk";
import type { ProcessTerm } from "../entities/ProcessTerm";
import { highlightText } from "./highlightText";

interface generatorListInfo {
	name: string;
	description: string;
}

interface SearchGeneratorParams {
	message: string;
	generatorList: generatorListInfo[];
	processTerm: ProcessTerm;
}

export const searchGenerator = ({
	message = "Please choose a generator",
	generatorList,
	processTerm,
}: SearchGeneratorParams): Promise<string> & { cancel: () => void } => {
	return search(
		{
			message,
			source: (input) => {
				let currentGenList = generatorList;
				if (input) {
					currentGenList = generatorList.filter(({ name }) =>
						name.toLowerCase().includes(input),
					);
				}

				return currentGenList.map(({ name, description }) => {
					const nameHt = input ? highlightText(name, input) : name;
					return {
						name: `${nameHt}${chalk.dim(` - ${description}`)}`,
						value: name,
					};
				});
			},
			theme: {
				prefix: { done: chalk.green.bold("✦") },
				style: {
					answer: (text: string) => {
						return chalk.cyanBright(text.split(" - ")[0]);
					},
					message: (text: string, status: string) => {
						if (status === "done") {
							return chalk.bold("You use generator");
						}
						return chalk.bold(text);
					},
				},
			},
		},
		{
			input: processTerm.stdin,
			output: processTerm.stdout,
		},
	);
};
