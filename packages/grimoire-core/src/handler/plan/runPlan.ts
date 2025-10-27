import path from "node:path";
import type { Cli } from "~/Cli";
import type {
	Generators,
	Plan,
	PlanPatches,
	RecordCamelCase,
} from "~/models";
import { FilePlanError } from "~/errors";
import { pathConstructor } from "~/path";
import { readPlan } from "~/utils";
import { applyPlanPatches } from "./applyPlanPatches";
import { sanitizePlan } from "./sanitizePlan";
import { separateArgsAndPlan } from "./separateArgsAndPlan";

export interface GenFnParams {
	cli: Cli;
	dest: string;
	planName: string;
	args: string[] | [string, Record<string, string>];
	generators: Generators;
	force?: boolean;
}

interface RunPlanParams {
	args: string | Plan;
	cli: Cli;
	generators: Generators;
	parentConfig: RecordCamelCase<string, string> | null;
	genFn: (params: GenFnParams) => Promise<void>;
	force?: boolean;
	deep?: boolean;
	oldDest?: string;
	ignoreDest?: boolean;
	oldPlanName?: string;
	patches?: PlanPatches;
}

export const runPlan = async ({
	args: currentArgs,
	cli,
	generators,
	parentConfig,
	genFn,
	oldDest: newOldDest,
	force = false,
	deep = false,
	ignoreDest = false,
	oldPlanName,
	patches,
}: RunPlanParams): Promise<{
	argsList: (string | Plan)[];
	dest: string;
	planName: string;
}> => {
	const processTerm = cli.getProcessTerm();
	const oldDest = newOldDest || processTerm.cwd();
	let anyArgs: string | Plan;
	let currentFileName: string = oldPlanName;

	if (typeof currentArgs === "string") {
		anyArgs = readPlan(cli, currentArgs, parentConfig);
		if (!anyArgs.planName) {
			currentFileName = path.basename(currentArgs, path.extname(currentArgs));
		}
	} else {
		anyArgs = currentArgs;
	}
	if (!anyArgs.planName && currentFileName) {
		anyArgs.planName = currentFileName;
	}

	const { isPlan, isArrays, args: sanitizeArgs } = sanitizePlan(anyArgs);
	if (!isPlan) {
		throw new FilePlanError("Only '.plan.json' files are allowed.");
	}
	if (isArrays) {
		throw new FilePlanError("Only one '.plan.json' files are allowed.");
	}

	const patchedArgs =
		patches && Object.keys(patches).length
			? applyPlanPatches(sanitizeArgs as Plan, patches)
			: (sanitizeArgs as Plan);

	const { genName, genDest, argsList, args, planName } = separateArgsAndPlan(
		patchedArgs,
		deep,
		ignoreDest,
	);

	const dest = await pathConstructor(cli, genDest, oldDest);

	await genFn({
		dest,
		planName,
		args: [genName, args as Record<string, string>],
		generators,
		cli,
		force,
	});

	return { argsList, dest, planName };
};
