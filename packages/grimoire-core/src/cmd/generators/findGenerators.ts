import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import { getGlobalConfig } from "~/config/global";
import { getRoots, setRoots } from "~/config/roots";
import { CONFIG_FILE, CONFIG_FILE_EXT } from "~/const/config";
import { ROOTS } from "~/const/roots";
import type { Generators, GeneratorsConfig } from "~/entities/Generators";
import type { ProcessTerm } from "~/entities/ProcessTerm";
import { findRoots } from "~/path/findRoots";
import { removeLine } from "~/prompts/removeLine";
import { searchList } from "~/prompts/searchList";
import { logger } from "~/utils/logger";
import { readConfigCliFile } from "~/utils/readConfigCliFile";

interface findGeneratorsParams {
	config: GeneratorsConfig;
	processTerm: ProcessTerm;
	typeGen?: string;
}

export const findGenerators = async ({
	config: { subGenConf, ...generatorsConfig },
	processTerm,
	typeGen,
}: findGeneratorsParams): Promise<Generators> => {
	if (!subGenConf) {
		return generatorsConfig as Generators;
	}
	if (typeGen && generatorsConfig[typeGen]) {
		return generatorsConfig[typeGen] as Generators;
	}
	let rootTypeGen = null;
	if (!typeGen) {
		let parent = getRoots(ROOTS.PARENT);
		if (!parent) {
			const currentRoots = findRoots();
			if (currentRoots?.[ROOTS.PARENT]) {
				setRoots(currentRoots);
			}
			parent = currentRoots[ROOTS.PARENT];
		}
		const filename = getGlobalConfig()?.configFile || CONFIG_FILE;
		const ext = getGlobalConfig()?.configFileExt || CONFIG_FILE_EXT;
		const parentConfig = path.join(parent || "./", `${filename}.${ext}`);
		if (fs.existsSync(parentConfig)) {
			const { typeGen } = readConfigCliFile(parentConfig);
			rootTypeGen = typeGen || "NO_TYPE";
		}
	}

	if (
		rootTypeGen &&
		rootTypeGen !== "NO_TYPE" &&
		generatorsConfig[rootTypeGen]
	) {
		return generatorsConfig[rootTypeGen] as Generators;
	}
	if (typeGen || (rootTypeGen && rootTypeGen !== "NO_TYPE")) {
		logger({
			processTerm,
			args: [
				chalk.yellow.bold("⚠"),
				chalk.yellow("Type Generators"),
				chalk.cyanBright(typeGen || rootTypeGen),
				chalk.yellow("isn't in the list"),
			],
		});
	}
	const typeGenList = Object.keys(generatorsConfig);
	const message = "Please choose a type of generator list";
	const type = await searchList({ message, list: typeGenList, processTerm });
	removeLine({ processTerm, nb: 1 });
	return generatorsConfig[type] as Generators;
};
