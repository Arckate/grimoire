import { TYPE_GEN } from "@arckate/grimoire-core/const";
import type {
	ConstructorContext,
	ConstructorFn,
	GeneratorsSubConfig,
} from "@arckate/grimoire-core/models";
import {
	findPlanFileArgs,
	runDeepPlan,
	runGen,
} from "@arckate/grimoire-core/handler";
import { findParentConfig, pathConstructor } from "@arckate/grimoire-core/path";

interface CtorPlanParams {
	typeGen?: string;
	in: string;
	out?: string;
	force?: boolean;
	deep?: boolean;
	ignoreDest?: boolean;
}

export const ctorPlan: ConstructorFn<CtorPlanParams> = async (
	configKey,
	{ force, deep, ignoreDest, typeGen, in: inPath },
	{ cli, dest, force: forceGlobal }: ConstructorContext,
) => {
	const parentConfig = findParentConfig(cli);
	const argsList = await findPlanFileArgs({
		cli,
		inPath,
		parentConfig,
	});

	const destFile = await pathConstructor(cli, dest);
	await runDeepPlan({
		cli,
		argsList,
		force: force || forceGlobal,
		deep: deep,
		dest: destFile,
		ignoreDest: ignoreDest,
		generatorsConfig: cli.getConfCmd<GeneratorsSubConfig>(configKey).config,
		typeGen: typeGen || TYPE_GEN,
		parentConfig,
		genFn: async (params) => {
			cli.addGlobals({ dest: params.dest, planName: params.planName });
			await runGen({
				args: params.args,
				generators: params.generators,
				cli: params.cli,
				force: params.force,
			});
		},
	});
};
