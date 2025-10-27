import type { Plan } from "./Plan";

export type PlanPatch = {
	selector: Partial<Plan>;
	value: Partial<Plan>;
};

export type PlanPatches = Record<`${string}patch`, PlanPatch>;
