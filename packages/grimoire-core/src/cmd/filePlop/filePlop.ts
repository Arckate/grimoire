import path from "node:path";
import chalk from "chalk";
import nodePlop from "node-plop";
import { getGlobalConfig } from "~/config/global";
import type { RecordCamelCase } from "~/entities/CmdConfig";
import type { GenObject } from "~/entities/GenObject";
import type { ProcessTerm } from "~/entities/ProcessTerm";
import { FileGenObjectError } from "~/errors/FileGenObjectError";
import { pathConstructor } from "~/path/pathConstructor";
import { logger } from "~/utils/logger";
import { readGenFile } from "~/utils/readGenFile";
import { sanitizeGenObject } from "./sanitizeGenObject";
import { separateArgsAndGenObject } from "./separateArgsAndGenObject";

interface FilePlopParams {
	args: string | GenObject;
	configPath: string;
	force?: boolean;
	deep?: boolean;
	oldDest?: string;
	ignoreDest?: boolean;
	processTerm: ProcessTerm;
	oldGenFileName?: string;
	parentConfig: RecordCamelCase<string, string> | null;
}
export const filePlop = async ({
	args: currentArgs,
	configPath,
	oldDest = process.cwd(),
	force = false,
	deep = false,
	ignoreDest = false,
	processTerm,
	oldGenFileName,
	parentConfig,
}: FilePlopParams): Promise<{
	argsList: (string | GenObject)[];
	dest: string;
	genFileName: string;
}> => {
	let anyArgs: string | GenObject;
	let currentFileName: string = oldGenFileName;
	if (typeof currentArgs === "string") {
		anyArgs = readGenFile(currentArgs, parentConfig);
		if (!anyArgs.genFileName) {
			currentFileName = path.basename(currentArgs, path.extname(currentArgs));
		}
	} else {
		anyArgs = currentArgs;
	}
	if (!anyArgs.genFileName && currentFileName) {
		anyArgs.genFileName = currentFileName;
	}

	const {
		isGenObject,
		isArrays,
		args: sanitizeArgs,
	} = sanitizeGenObject(anyArgs);
	if (!isGenObject) {
		throw new FileGenObjectError("Only '.gen.json' files are allowed.");
	}
	if (isArrays) {
		throw new FileGenObjectError("Only one '.gen.json' files are allowed.");
	}

	const { genName, genDest, argsList, args, genFileName } =
		separateArgsAndGenObject(sanitizeArgs as GenObject, deep, ignoreDest);

	const dest = await pathConstructor(genDest, oldDest);
	const plop = await nodePlop(configPath, {
		force,
		destBasePath: dest,
	});

	plop.setDefaultInclude({ findFile: getGlobalConfig()?.findFile || {} });

	logger({
		processTerm,
		args: [
			chalk.green.bold("✦"),
			chalk.bold("You use generator"),
			chalk.cyanBright(genName),
		],
	});
	const generator = plop.getGenerator(genName);
	const { changes, failures } = await generator.runActions({
		isGenFile: true,
		genFileName,
		args,
	});

	changes.forEach(({ type, path }) => {
		logger({
			processTerm,
			args: [chalk.green("✔"), chalk.blueBright.bold.italic(`[${type}]`), path],
		});
	});
	failures.forEach(({ type, error }) => {
		logger({
			processTerm,
			args: [chalk.red("✖"), chalk.blueBright.bold.italic(`[${type}]`), error],
		});
	});

	return { argsList, dest, genFileName };
};
