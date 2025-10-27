export const formatArgs = (
	args: (string | Record<string, string>)[],
): string[] | Record<string, string> => {
	if (!args.length || (args.length && typeof args[0] === "string")) {
		return args as string[];
	}
	return args[0] as Record<string, string>;
};
