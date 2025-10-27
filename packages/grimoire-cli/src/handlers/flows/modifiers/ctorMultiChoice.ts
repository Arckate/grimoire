import { findConstructorArg } from "@arckate/grimoire-core/handler";
import type {
	ConstructorContext,
	ConstructorFn,
	StepOf,
} from "@arckate/grimoire-core/models";
import { removeLine, searchList } from "@arckate/grimoire-core/prompts";
import { capitalizeFirst, logger } from "@arckate/grimoire-core/utils";
import chalk from "chalk";

export type CtorMultiChoiceStep = StepOf<ConstructorFn<CtorMultiChoiceParams>>;

interface CtorMultiChoiceParams {
	question: string;
	key: string;
	otherKey?: string[];
	values: Record<string, string | CtorMultiChoiceStep>;
}

export const ctorMultiChoice: ConstructorFn<CtorMultiChoiceParams> = async (
	_configKey,
	params,
	ctx: ConstructorContext,
) => {
	const { cli, nameSpace, args, filters } = ctx;
	const processTerm = cli.getProcessTerm();
	const currentKey = `${nameSpace}${nameSpace ? capitalizeFirst(params.key) : params.key}`;
	const currentOtherKey = params.otherKey
		? params.otherKey.map(
				(key) => `${nameSpace}${nameSpace ? capitalizeFirst(key) : key}`,
			)
		: [];

	let value = findConstructorArg(args, currentKey, filters);
	const list = Object.keys(params.values);

	if (!value || !list.includes(value)) {
		if (value && !list.includes(value)) {
			logger({
				processTerm,
				args: [
					chalk.yellow.bold("⚠"),
					chalk.yellow(params.key),
					chalk.cyanBright(value),
					chalk.yellow("isn't in the list"),
				],
			});
		}
		value = await searchList({ message: params.question, list, processTerm });
		removeLine({ processTerm, nb: 1 });
	}

	const selected = params.values[value];

	if (typeof selected === "string") {
		for (const key of [currentKey, ...currentOtherKey]) {
			filters[key] = selected;
		}
		return;
	}

	for (const key of [currentKey, ...currentOtherKey]) {
		filters[key] = value;
	}

	return Promise.resolve({ steps: [selected], ctx });
};
