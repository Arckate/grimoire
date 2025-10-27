import { search } from "@inquirer/prompts";
import chalk from "chalk";
import type { ProcessTerm } from "../entities/ProcessTerm";
import { highlightText } from "./highlightText";

interface SearchListParams {
	message: string;
	list: string[];
	processTerm: ProcessTerm;
}

export const searchList = ({
	message = "Please choose a type of generator list",
	list,
	processTerm,
}: SearchListParams): Promise<string> & { cancel: () => void } => {
	return search(
		{
			message,
			source: (input) => {
				let currentList = list;
				if (input) {
					currentList = list.filter((value) =>
						value.toLowerCase().includes(input),
					);
				}
				return currentList.map((name) => ({
					name: input ? highlightText(name, input) : name,
					value: name,
				}));
			},
			theme: {
				prefix: { done: chalk.green.bold("✦") },
				style: {
					answer: (text: string) => {
						return chalk.cyanBright(text.split(" - ")[0]);
					},
					message: (text: string, status: string) => {
						if (status === "done") {
							return "You use type";
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
