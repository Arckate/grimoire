import type { Filter } from "~/entities/Starters";

export const filterValues = <T>(
	filter: Filter<T>,
	args: Record<string, string>,
): T => {
	if (args[filter.keyFilter]) {
		return filter.values[args[filter.keyFilter]];
	}
	return filter.values[filter.defaultFilter];
};
