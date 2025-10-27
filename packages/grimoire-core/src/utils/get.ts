export const get = <T = any>(
	obj: Record<string, any>,
	path: string,
	defaultValue: T = undefined as T,
): T => {
	const regex = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])(.*?)\2)\]/g;
	const keys: string[] = [];

	path.replace(regex, (_, number, __, quotedKey) => {
		keys.push(quotedKey ?? number ?? _);
		return "";
	});

	const result = keys.reduce(
		(res, key) => (res !== null && res !== undefined ? res[key] : res),
		obj,
	);
	return result === undefined || result === obj ? defaultValue : result;
};
