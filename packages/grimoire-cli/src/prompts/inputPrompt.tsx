import type { ProcessTerm } from "@arckate/grimoire-core/entities";
import { render } from "ink";
import Input from "./components/Input";

interface InputPromptParams {
	message: string;
	processTerm: ProcessTerm;
}

export const inputPrompt = ({
	message = "Please write a value",
	processTerm,
}: InputPromptParams): Promise<string> => {
	return new Promise<string>((resolve) => {
		render(
			<Input
				message={message}
				onSubmit={(value) => {
					resolve(value);
				}}
				isExited
			/>,
			{
				stdout: processTerm.stdout,
				stdin: processTerm.stdin,
				interactive: true,
				patchConsole: false,
			},
		);
	});
};
