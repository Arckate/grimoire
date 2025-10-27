import readline from "node:readline";
import type { ProcessTerm } from "../entities/ProcessTerm";

interface RemoveLine {
	processTerm: ProcessTerm;
	nb: number;
}
export const removeLine = ({ processTerm, nb }: RemoveLine) => {
	for (let pas = 0; pas < nb; pas++) {
		readline.moveCursor(processTerm.stdout, 0, -1);
		readline.clearLine(processTerm.stdout, 0);
	}
};
