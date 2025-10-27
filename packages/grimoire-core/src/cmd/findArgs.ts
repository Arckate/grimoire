export const findArgs = (
	defaultArgs: any,
	rawArgs: Record<string, string>,
): string[] | [string, Record<string, string>] => {
	if (Object.keys(rawArgs).length) {
		return [defaultArgs[0], rawArgs];
	}
	return defaultArgs;
};
