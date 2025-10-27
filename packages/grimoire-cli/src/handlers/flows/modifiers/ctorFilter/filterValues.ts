import type { CtorFilter, CtorFilterStep } from "./ctorFilter";

export const filterValues = (
	filter: CtorFilter,
	args: Record<string, string>,
): CtorFilterStep => {
	if (args[filter.keyFilter]) {
		return filter.values[args[filter.keyFilter]];
	}
	return filter.values[filter.defaultFilter];
};
