import { SKIP_PARAMS_VALUE } from "~/const/skippedParams";

export const findConstructorArg = (
	args: string[] | Record<string, string>,
	name: string,
): string | null => {
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
