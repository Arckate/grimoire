import { input as inqInput } from "@inquirer/prompts";
import type { ProcessTerm } from "../entities/ProcessTerm";

interface InputParams {
	message: string;
	processTerm: ProcessTerm;
}

export const input = ({
	message = "Please write a value",
	processTerm,
}: InputParams): Promise<string> & { cancel: () => void } => {
	return inqInput(
		{
			message,
		},
		{
			input: processTerm.stdin,
			output: processTerm.stdout,
		},
	);
};
