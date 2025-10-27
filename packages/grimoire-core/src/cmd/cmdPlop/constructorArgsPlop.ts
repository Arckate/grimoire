import type { Prompts } from "node-plop";
import { SKIP_PARAMS_VALUE } from "~/const/skippedParams";

export const constructorArgsPlop = (
	args: (string | Record<string, string>)[],
	prompts: Prompts,
): string[] => {
	if (!args.length || typeof args[0] === "string") {
		return args as string[];
	}
	const argObject = args[0];
	return Object.values(prompts).flatMap(({ name }) => {
		if (argObject[name]) {
			return argObject[name];
		}
		return SKIP_PARAMS_VALUE;
	});
};
