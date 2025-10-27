import { capitalizeFirst } from "@arckate/grimoire-core/utils";
import merge from "lodash.merge";
import type { CtorEdit, CtorEditStep } from "./ctorEdit";

export const edit = (
	editAll: CtorEdit,
	nameSpace: string,
	args: Record<string, string>,
): CtorEditStep => {
	let value = editAll.value;
	if (editAll.keys && Object.keys(editAll.keys).length) {
		const newValue = {};
		Object.keys(editAll.keys).forEach((key) => {
			if (typeof editAll.keys[key] === "object") {
				newValue[key] = {};
				Object.keys(editAll.keys[key]).forEach((keyChild) => {
					const nameKey = `${nameSpace}${nameSpace ? capitalizeFirst(editAll.keys[key][keyChild]) : editAll.keys[key][keyChild]}`;
					if (args?.[nameKey]) {
						newValue[key][keyChild] = args?.[nameKey];
					}
				});
			}
			if (typeof editAll.keys[key] === "string") {
				const nameKey = `${nameSpace}${nameSpace ? capitalizeFirst(editAll.keys[key]) : editAll.keys[key]}`;
				if (args?.[nameKey]) {
					newValue[key] = args?.[nameKey];
				}
			}
		});

		value = merge(value, newValue);
	}
	return value;
};
