import type { Cli } from "~/Cli";
import { ROOTS } from "~/const";
import type {
	GeneratorsSubConfig,
	Plan,
	PlanPatches,
	RecordCamelCase,
} from "~/models";
import { findParentConfig, findRoots, isConfigFileInFolder } from "~/path";
import { findGenerators } from "../gen";
import { type GenFnParams, runPlan } from "./runPlan";

interface RunDeepPlanParams {
	cli: Cli;
	argsList: (string | Plan)[];
	generatorsConfig: GeneratorsSubConfig;
	genFn: (params: GenFnParams) => Promise<void>;
	force?: boolean;
	deep?: boolean;
	dest?: string;
	ignoreDest?: boolean;
	typeGen?: string;
	planName?: string;
	parentConfig: RecordCamelCase<string, string>;
	parent?: string;
	patches?: PlanPatches;
}

export const runDeepPlan = async ({
	cli,
	argsList,
	force = false,
	dest: newDest,
	ignoreDest = false,
	typeGen,
	deep = false,
	generatorsConfig,
	genFn,
	planName,
	parentConfig,
	parent: initialParent,
	patches,
}: RunDeepPlanParams): Promise<boolean> => {
	const processTerm = cli.getProcessTerm();
	const dest = newDest || processTerm.cwd();
	const generators = await findGenerators({
		cli,
		config: generatorsConfig,
		typeGen,
	});

	for (const args of argsList) {
		let innerParentConfig = parentConfig;
		let innerTypeGen = typeGen;
		let currentGenerators = generators;
		let parent =
			initialParent ??
			findRoots({ processTerm, config: cli.getConfig() })[ROOTS.PARENT];

		if (
			((parent && !dest.startsWith(parent)) ||
				isConfigFileInFolder({ processTerm, config: cli.getConfig() })) &&
			!generators.subGenConf
		) {
			innerParentConfig = findParentConfig(cli);
			currentGenerators = await findGenerators({
				cli,
				config: generatorsConfig,
				...(innerParentConfig.typeGen
					? { typeGen: innerParentConfig.typeGen }
					: {}),
			});
			if (innerParentConfig.typeGen) {
				innerTypeGen = innerParentConfig.typeGen;
			}
			parent = cli.getDir(ROOTS.PARENT);
		}

		const {
			argsList: childArgsList,
			dest: childDest,
			planName: childPlanName,
		} = await runPlan({
			args,
			cli,
			generators: currentGenerators,
			force,
			oldDest: dest,
			ignoreDest,
			deep,
			oldPlanName: planName,
			parentConfig: innerParentConfig,
			patches,
			genFn,
		});

		if (argsList.length) {
			await runDeepPlan({
				cli,
				argsList: childArgsList,
				dest: childDest,
				planName: childPlanName,
				force,
				typeGen: innerTypeGen,
				deep,
				generatorsConfig,
				parentConfig: innerParentConfig,
				parent,
				patches,
				genFn,
			});
		}
	}
	cli.setDirs({ [ROOTS.PARENT]: initialParent });
	return true;
};
