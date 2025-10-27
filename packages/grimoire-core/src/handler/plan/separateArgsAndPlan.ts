import { PLAN_KEYS } from "~/const";
import type { Plan } from "~/models";
import { sanitizePlan } from "./sanitizePlan";

interface SeparateArgsAndPlan {
	genName: string;
	genDest: string;
	planName: string;
	argsList: (string | Plan)[];
	args: Record<string, unknown>;
}

export const separateArgsAndPlan = (
	{ genName, ...args }: Plan,
	deep: boolean,
	ignoreDest: boolean,
): SeparateArgsAndPlan => {
	const separateArgs: SeparateArgsAndPlan = {
		genName,
		genDest: "",
		planName: "",
		argsList: [],
		args: {},
	};

	Object.entries(args).forEach(([name, value]) => {
		if (
			[String(PLAN_KEYS.PLAN_ID), String(PLAN_KEYS.PLAN_META)].includes(name)
		) {
			return;
		}
		if (
			name === PLAN_KEYS.PLAN_DEST &&
			typeof value === "string" &&
			!ignoreDest
		) {
			separateArgs.genDest = value;
			return;
		}
		if (name === PLAN_KEYS.PLAN_LINK && typeof value === "string" && deep) {
			separateArgs.argsList.push(value);
			return;
		}

		if (name === PLAN_KEYS.PLAN_NAME && typeof value === "string") {
			separateArgs.planName = value;
			return;
		}

		const { isPlan, isArrays, args } = sanitizePlan(value);

		if (isPlan && isArrays) {
			separateArgs.argsList.push(...args);
		}
		if (isPlan && !isArrays) {
			separateArgs.argsList.push(args as Plan);
		}
		separateArgs.args[name] = value;
	});
	return separateArgs;
};
