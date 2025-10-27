import chalk from "chalk";
import { setGenerators } from "~/config/generators";
import { setInits } from "~/config/inits";
import { STARTER_TYPES } from "~/const/starters";
import type { GeneratorsConfig } from "~/entities/Generators";
import type { InitsConfig } from "~/entities/Inits";
import type { ProcessTerm } from "~/entities/ProcessTerm";
import type {
	CmdInitParams,
	CmdPlopParams,
	FilePlopParams,
	SetValues,
	StarterLink,
	StarterParams,
	Starters,
} from "~/entities/Starters";
import { StarterConfigError } from "~/errors/StarterConfigError";
import { findParentConfig } from "~/path/findParentConfig";
import { pathConstructor } from "~/path/pathConstructor";
import { input } from "~/prompts";
import { searchList } from "~/prompts/searchList";
import { capitalizeFirst } from "~/utils";
import { logger } from "~/utils/logger";
import { cmdPlop } from "../cmdPlop";
import { deepFilePlop } from "../filePlop";
import { findFilePlopArgs } from "../findFilePlopArgs";
import { findGenerators } from "../generators";
import { findStarter } from "../starter/findStarter";
import { filterValues } from "./filterValues";
import { findConstructorArg } from "./findConstructorArg";
import { formatArgs } from "./formatArgs";
import { formatStep } from "./formatStep";
import { setValues } from "./setValues";

interface ConstructorPlopParams {
	args: string[] | [string, Record<string, string>];
	configPath: string;
	generatorsConfig: GeneratorsConfig;
	initsConfig: InitsConfig;
	starterConfig: Record<string, Starters>;
	force?: boolean;
	dest?: string;
	nameSpace?: string;
	filters?: Record<string, string>;
	processTerm: ProcessTerm;
}

export const constructorPlop = async ({
	args: [starterName, ...newArgs],
	configPath,
	generatorsConfig,
	initsConfig,
	starterConfig,
	force = false,
	dest: globalDest = process.cwd(),
	nameSpace = "",
	filters = {},
	processTerm,
}: ConstructorPlopParams): Promise<boolean> => {
	// transform type from (string | Record<string, string>)[] to string[] | Record<string, string>
	const { isArrayArgs, args: formattedArgs } = formatArgs(newArgs);

	const parentConfig = findParentConfig();

	const starter = await findStarter({
		starters: starterConfig,
		starterName,
		processTerm,
	});
	for (const starterStep of Object.values(starter)) {
		const constructorStep = async (
			anyStep: StarterParams,
			innerFilters: Record<string, string>,
			args: string[] | Record<string, string>,
		) => {
			const { type, step } = formatStep(anyStep);
			switch (type) {
				case STARTER_TYPES.UNKNOWN:
					throw new StarterConfigError("bad starter format");
				case STARTER_TYPES.MULTI_CHOICE: {
					const currentKey = `${nameSpace}${nameSpace ? capitalizeFirst(step.key) : step.key}`;
					const currentOtherKey = step.otherKey
						? step.otherKey.map(
								(key) =>
									`${nameSpace}${nameSpace ? capitalizeFirst(key) : key}`,
							)
						: [];
					let value = findConstructorArg(args, currentKey, innerFilters);

					const { type: typeChild, step: StepValues } = formatStep(step.values);
					// values is only of type "Filter" or "values of multi choice" (Record<string,any>)
					if (
						[STARTER_TYPES.FILTER, STARTER_TYPES.UNKNOWN].includes(typeChild)
					) {
						let values = StepValues;
						if (typeChild === STARTER_TYPES.FILTER) {
							values = filterValues<
								| Record<string, CmdPlopParams | FilePlopParams | StarterLink>
								| Record<string, string>
							>(StepValues, innerFilters);
						}

						const list = Object.keys(values);
						if (!value || !list.includes(value)) {
							if (value && !list.includes(value)) {
								logger({
									processTerm,
									args: [
										chalk.yellow.bold("⚠"),
										chalk.yellow(step.key),
										chalk.cyanBright(value),
										chalk.yellow("isn't in the list"),
									],
								});
							}

							value = await searchList({
								message: step.question,
								list: Object.keys(values),
								processTerm,
							});
						}

						if (value && typeof values[value] === "string") {
							[currentKey, ...currentOtherKey].forEach((key) => {
								innerFilters[key] = values[value];
							});
							break;
						}
						[currentKey, ...currentOtherKey].forEach((key) => {
							innerFilters[key] = value;
						});
						await constructorStep(values[value], innerFilters, args);
					}
					break;
				}
				case STARTER_TYPES.INPUT: {
					const currentKey = `${nameSpace}${nameSpace ? capitalizeFirst(step.key) : step.key}`;
					const currentOtherKey = step.otherKey
						? step.otherKey.map(
								(key) =>
									`${nameSpace}${nameSpace ? capitalizeFirst(key) : key}`,
							)
						: [];
					let value = findConstructorArg(args, currentKey, innerFilters);

					if (!value) {
						value = await input({
							message: step.inputQuestion,
							processTerm,
						});
					}
					[currentKey, ...currentOtherKey].forEach((key) => {
						innerFilters[key] = value;
					});
					break;
				}
				case STARTER_TYPES.FILTER: {
					const valueFilter = filterValues<
						| CmdPlopParams
						| FilePlopParams
						| StarterLink
						| CmdInitParams
						| SetValues<CmdPlopParams | FilePlopParams | CmdInitParams>
					>(step, innerFilters);
					await constructorStep(valueFilter, innerFilters, args);
					break;
				}
				case STARTER_TYPES.SET_VALUES: {
					const value = setValues<
						CmdPlopParams | FilePlopParams | CmdInitParams
					>(step, nameSpace, innerFilters);

					await constructorStep(value, innerFilters, args);
					break;
				}
				case STARTER_TYPES.STARTER:
					await constructorPlop({
						args: [step.starterName],
						configPath,
						generatorsConfig,
						initsConfig,
						starterConfig,
						force,
						dest: globalDest,
						nameSpace: `${nameSpace}${step.nameSpace}`,
						filters: innerFilters,
						processTerm,
					});
					break;
				case STARTER_TYPES.CMD_PLOP: {
					const destCmd = await pathConstructor(globalDest);
					const generatorsCmd = await findGenerators({
						config: generatorsConfig,
						typeGen: step.typeGen || "default",
						processTerm,
					});
					setGenerators(generatorsCmd);
					await cmdPlop({
						args: [step.generator, step.params || {}],
						configPath,
						dest: destCmd,
						force: step.force || force,
						processTerm,
						ignorePrompts: step.ignorePrompts || false,
					});
					break;
				}
				case STARTER_TYPES.INIT: {
					const destCmd = await pathConstructor(globalDest);
					setInits(initsConfig);
					await cmdPlop({
						args: [step.initGenerator, step.params || {}],
						configPath,
						dest: destCmd,
						force: step.force || force,
						processTerm,
						ignorePrompts: step.ignorePrompts || false,
					});
					break;
				}
				case STARTER_TYPES.FILE_PLOP: {
					await findFilePlopArgs({
						processTerm,
						inPath: step.in,
						parentConfig,
						filePlopFn: async (argsList) => {
							const destFile = await pathConstructor(globalDest);
							await deepFilePlop({
								argsList,
								configPath,
								force: step.force || force,
								deep: step.deep,
								dest: destFile,
								ignoreDest: step.ignoreDest,
								generatorsConfig,
								typeGen: step.typeGen || "default",
								processTerm,
								parentConfig,
							});
						},
					});
					break;
				}
			}
		};
		await constructorStep(
			starterStep,
			filters,
			isArrayArgs ? formattedArgs : formattedArgs,
		);
	}
	return true;
};
