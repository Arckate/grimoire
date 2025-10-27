import chalk from "chalk";
import type { ProcessTerm } from "../entities/ProcessTerm";

interface LoggerParams {
	processTerm: ProcessTerm;
	args: (string | object)[];
}

export const logger = ({ processTerm, args }: LoggerParams) => {
	const formatted = args
		.map((arg) => {
			if (typeof arg === "object") {
				return JSON.stringify(arg, null, 2);
			}
			return arg;
		})
		.join(" ");

	processTerm.stdout.write(`${formatted}\n`);
};

interface logErrorParams {
	processTerm: ProcessTerm;
	error: Error;
}

export const logError = ({ processTerm, error }: logErrorParams) =>
	logger({
		processTerm,
		args: [chalk.bgRed(error.name), chalk.red(error.message)],
	});
