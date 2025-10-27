import { SKIP_PARAMS_VALUE } from "~/const/skippedParams";

export const findConstructorArg = (
	args: string[] | Record<string, string>,
	name: string,
	innerFilters: Record<string, string>,
): string | null => {
	if (innerFilters[name]) {
		return innerFilters[name];
	}

	if (Array.isArray(args)) {
		const firstElement = args.shift();
		if (args.length && firstElement && firstElement !== SKIP_PARAMS_VALUE) {
			return firstElement;
		}
		return null;
	}

	if (args[name]) {
		return args[name];
	}
	return null;
};
