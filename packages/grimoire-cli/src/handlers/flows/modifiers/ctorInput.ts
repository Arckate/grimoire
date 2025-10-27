import { findConstructorArg } from "@arckate/grimoire-core/handler";
import type {
	ConstructorContext,
	ConstructorFn,
} from "@arckate/grimoire-core/models";
import { input } from "@arckate/grimoire-core/prompts";
import { capitalizeFirst } from "@arckate/grimoire-core/utils";

interface CtorInputParams {
	inputQuestion: string;
	key: string;
	otherKey?: string[];
}

export const ctorInput: ConstructorFn<CtorInputParams> = async (
	_configKey,
	params,
	{ cli, nameSpace, args, filters }: ConstructorContext,
) => {
	const currentKey = `${nameSpace}${nameSpace ? capitalizeFirst(params.key) : params.key}`;
	const currentOtherKey = params.otherKey
		? params.otherKey.map(
				(key) => `${nameSpace}${nameSpace ? capitalizeFirst(key) : key}`,
			)
		: [];

	let value = findConstructorArg(args, currentKey, filters);
	if (!value) {
		value = await input({
			message: params.inputQuestion,
			processTerm: cli.getProcessTerm(),
		});
	}
	for (const key of [currentKey, ...currentOtherKey]) {
		filters[key] = value;
	}
};
