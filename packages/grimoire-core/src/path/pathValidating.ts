import fs from "node:fs/promises";
import { formatError } from "~/utils/formatError";
import { logError } from "~/utils/logger";
import type { ProcessTerm } from "../entities/ProcessTerm";

export interface PathValidating {
	isValidPath: boolean;
	isDirectory: boolean;
	isFile: boolean;
}

export const pathValidating = async (
	processTerm: ProcessTerm,
	path: string,
): Promise<PathValidating> => {
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
		logError({ processTerm, error });
		return {
			isValidPath: false,
			isDirectory: false,
			isFile: false,
		};
	}
};
