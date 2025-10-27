import mergeWith from "lodash.mergewith";
import type { Plan, PlanPatch, PlanPatches } from "~/models";

export type { PlanPatch, PlanPatches };

const deepPartialMatch = (target: unknown, partial: unknown): boolean => {
	if (Array.isArray(partial)) {
		if (!Array.isArray(target)) return false;
		return partial.every((partialItem) => {
			if (typeof partialItem !== "object" || partialItem === null) {
				return target.includes(partialItem);
			}
			return target.some((targetItem) =>
				deepPartialMatch(targetItem, partialItem),
			);
		});
	}
	if (typeof partial !== "object" || partial === null) {
		return target === partial;
	}
	if (typeof target !== "object" || target === null) {
		return false;
	}
	return Object.entries(partial as Record<string, unknown>).every(
		([key, val]) =>
			deepPartialMatch((target as Record<string, unknown>)[key], val),
	);
};

const matchesSelector = (plan: Plan, selector: Partial<Plan>): boolean =>
	Object.entries(selector).every(([key, val]) =>
		deepPartialMatch(plan[key], val),
	);

export const applyPlanPatches = (plan: Plan, patches: PlanPatches): Plan => {
	let result: Plan = structuredClone(plan);

	for (const patch of Object.values(patches)) {
		if (matchesSelector(result, patch.selector)) {
			const value = structuredClone(patch.value);
			result = mergeWith(result, value, (target: unknown, src: unknown) => {
				if (Array.isArray(src)) {
					return src.length === 0
						? []
						: [...(Array.isArray(target) ? target : []), ...src];
				}
			});
		}
	}

	return result;
};
