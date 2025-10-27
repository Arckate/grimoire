import readline from "node:readline";
import type { PromptFn } from "~/models";

type RemoveLineConfig = { nb: number };

export const removeLinePrompt: PromptFn<RemoveLineConfig> = async ({
	config: { nb },
	processTerm,
}): Promise<void> => {
	for (let pas = 0; pas < nb; pas++) {
		readline.moveCursor(processTerm.stdout, 0, -1);
		readline.clearLine(processTerm.stdout, 0);
	}
};
