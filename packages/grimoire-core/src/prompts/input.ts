import  inqInput  from "./test/myInput";
import type { ProcessTerm } from "../entities/ProcessTerm";

interface InputParams {
	message: string;
	processTerm: ProcessTerm;
	debug?: (params: {
		args: any[];
		escapeAnsi?: boolean;
	}) => void
}

export const input = ({
	message = "Please write a value",
	processTerm,
	debug = (params:any) => {}
}: InputParams): Promise<string> & { cancel: () => void } => {
	return inqInput(
		{
			message,
			debug,
		},
		{
			input: processTerm.stdin,
			output: processTerm.stdout,
		},
	);
};
