import chalk from "chalk";
import nodePlop from "node-plop";
import { getGlobalConfig } from "~/config/global";
import type { ProcessTerm } from "~/entities/ProcessTerm";
import { searchGenerator } from "~/prompts/searchGenerator";
import { logger } from "~/utils/logger";
import { clearQuestions } from "./clearQuestions";
import { constructorArgsPlop } from "./constructorArgsPlop";

interface CmdPlopParams {
	args: string[] | [string, Record<string, string>];
	configPath: string;
	processTerm: ProcessTerm;
	force?: boolean;
	dest?: string | undefined;
	ignorePrompts?: boolean;
}
export const cmdPlop = async ({
	args: [genName, ...newArgs],
	configPath,
	force = false,
	dest = process.cwd(),
	processTerm,
	ignorePrompts = false,
}: CmdPlopParams): Promise<boolean> => {
	const plop = await nodePlop(configPath, {
		force,
		destBasePath: dest,
	});

	plop.setDefaultInclude({ findFile: getGlobalConfig()?.findFile || {} });

	const generatorList = plop.getGeneratorList();
	let generatorName = genName || "";
	const generatorNotInList = !generatorList
		.map(({ name }) => name)
		.includes(generatorName);

	if (!generatorName || (generatorName && generatorNotInList)) {
		let message = "Please choose a generator";
		if (generatorName && generatorNotInList) {
			logger({
				processTerm,
				args: [
					chalk.yellow.bold("⚠"),
					chalk.yellow("Generator"),
					chalk.cyanBright(generatorName),
					chalk.yellow("isn't in the list"),
				],
			});
			message = "Please choose a valid generator";
		}
		generatorName = await searchGenerator({
			message,
			generatorList,
			processTerm,
		});
	} else {
		logger({
			processTerm,
			args: [
				chalk.green.bold("✦"),
				chalk.bold("You use generator"),
				chalk.cyanBright(generatorName),
			],
		});
	}
	const generator = plop.getGenerator(generatorName);
	let sanitizeArgs = {};

	if (ignorePrompts && typeof newArgs[0] === "object") {
		sanitizeArgs = newArgs[0];
	} else {
		const args = constructorArgsPlop(newArgs, generator.prompts);
		sanitizeArgs = await generator.runPrompts(args);
		clearQuestions(processTerm, args, sanitizeArgs);
	}

	const { changes, failures } = await generator.runActions(sanitizeArgs);

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
	logger({ processTerm, args: [""] });
	return true;
};
