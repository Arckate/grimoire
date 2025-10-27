import merge from "lodash.merge";
import type { SetValues } from "~/entities/Starters";
import { capitalizeFirst } from "~/utils";

export const setValues = <T>(
	setAllValue: SetValues<T>,
	nameSpace: string,
	args: Record<string, string>,
): T => {
	let value = setAllValue.value;
	if (setAllValue.keys && Object.keys(setAllValue.keys).length) {
		const newValue = {};
		Object.keys(setAllValue.keys).forEach((key) => {
			if (typeof setAllValue.keys[key] === "object") {
				newValue[key] = {};
				Object.keys(setAllValue.keys[key]).forEach((keyChild) => {
					const nameKey = `${nameSpace}${nameSpace ? capitalizeFirst(setAllValue.keys[key][keyChild]) : setAllValue.keys[key][keyChild]}`;
					if (args?.[nameKey]) {
						newValue[key][keyChild] = args?.[nameKey];
					}
				});
			}
			if (typeof setAllValue.keys[key] === "string") {
				const nameKey = `${nameSpace}${nameSpace ? capitalizeFirst(setAllValue.keys[key]) : setAllValue.keys[key]}`;
				if (args?.[nameKey]) {
					newValue[key] = args?.[nameKey];
				}
			}
		});

		value = merge(value, newValue);
	}
	return value;
};
