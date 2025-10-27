import fs from "node:fs";
import path from "node:path";
import type { Cli } from "~/Cli";
import { CONFIG_FILE, CONFIG_FILE_EXT, ROOTS } from "~/const";
import type {
	Generators,
	GeneratorsSubConfig,
	SubGenerators,
} from "~/models";
import { findRoots } from "~/path";

import { readConfigCliFile } from "~/utils";

const constructGenerators = (
	generatorsConfig: Omit<SubGenerators, "subGenConf">,
	typeGen: string,
): Generators => {
	const cloneGenerators = structuredClone(generatorsConfig);
	const generators = generatorsConfig[typeGen] as Generators;
	delete cloneGenerators[typeGen];
	Object.entries(cloneGenerators).forEach(
		([parentTypeGen, childGenerators]) => {
			Object.entries(childGenerators).forEach(
				([childTypeGen, fnGenerators]) => {
					generatorsConfig[`${parentTypeGen}_${childTypeGen}`] = fnGenerators;
				},
			);
		},
	);
	return generators;
};

interface findGeneratorsParams {
	cli: Cli;
	config: GeneratorsSubConfig;
	typeGen?: string;
}

export const findGenerators = async ({
	cli,
	config: { subGenConf, ...generatorsConfig },
	typeGen,
}: findGeneratorsParams): Promise<Generators> => {
	const processTerm = cli.getProcessTerm();
	const { cliTypeGenerators, cliRemoveLine } = cli.getPrompts();
	if (!subGenConf) {
		return generatorsConfig as Generators;
	}
	if (typeGen && generatorsConfig[typeGen]) {
		return constructGenerators(
			generatorsConfig as Omit<SubGenerators, "subGenConf">,
			typeGen,
		);
	}
	let rootTypeGen = null;
	if (!typeGen) {
		let parent = cli.getDirs()[ROOTS.PARENT];
		if (!parent) {
			const currentRoots = findRoots({ processTerm, config: cli.getConfig() });
			if (currentRoots?.[ROOTS.PARENT]) {
				cli.setDirs({ [ROOTS.PARENT]: currentRoots[ROOTS.PARENT] });
			}
			parent = currentRoots[ROOTS.PARENT];
		}
		const filename = cli.getConfig()?.configFile || CONFIG_FILE;
		const ext = cli.getConfig()?.configFileExt || CONFIG_FILE_EXT;
		const parentConfig = path.join(parent || "./", `${filename}.${ext}`);
		if (fs.existsSync(parentConfig)) {
			const { typeGen } = readConfigCliFile(cli.getConfig(), parentConfig);
			rootTypeGen = typeGen || "NO_TYPE";
		}
	}

	if (
		rootTypeGen &&
		rootTypeGen !== "NO_TYPE" &&
		generatorsConfig[rootTypeGen]
	) {
		return constructGenerators(
			generatorsConfig as Omit<SubGenerators, "subGenConf">,
			rootTypeGen,
		);
	}
	const invalidName =
		typeGen || (rootTypeGen && rootTypeGen !== "NO_TYPE" ? rootTypeGen : undefined) || undefined;
	const result = await cliTypeGenerators({
		message: "Please choose a type of generator",
		keyValue: "typeGen",
		config: { isValid: false, list: Object.keys(generatorsConfig) },
		defaultValue: invalidName,
		processTerm,
	});
	cliRemoveLine({ message: "", keyValue: "", config: { nb: 1 }, processTerm });
	return constructGenerators(
		generatorsConfig as Omit<SubGenerators, "subGenConf">,
		result.typeGen,
	);
};
