import fs from "node:fs/promises";
import type { Cli } from "~/Cli";

import { formatError } from "~/utils";

export interface PathValidating {
	isValidPath: boolean;
	isDirectory: boolean;
	isFile: boolean;
}

export const pathValidating = async (
	cli: Cli,
	path: string,
): Promise<PathValidating> => {
	const processTerm = cli.getProcessTerm();
	const { cliLoggerError } = cli.getPrompts();
	try {
		const stats = await fs.stat(path);
		const isFile = stats.isFile();
		return {
			isValidPath: true,
			isDirectory: stats.isDirectory(),
			isFile,
		};
	} catch (anyError) {
		const error = formatError(anyError);
		cliLoggerError({ message: "", keyValue: "", config: { error }, processTerm });
		return {
			isValidPath: false,
			isDirectory: false,
			isFile: false,
		};
	}
};
