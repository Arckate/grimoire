import type {
	ConstructorContext,
	ConstructorFn,
	StepOf,
} from "@arckate/grimoire-core/models";
import { filterValues } from "./filterValues";

export type CtorFilterStep = StepOf<ConstructorFn<CtorFilter>>;

export interface CtorFilter {
	keyFilter: string;
	defaultFilter: string;
	values: Record<string, CtorFilterStep>;
}

export const ctorFilter: ConstructorFn<CtorFilter> = async (
	_configKey,
	params,
	ctx: ConstructorContext,
) => {
	const step = filterValues(params, ctx.filters);
	return Promise.resolve({ steps: [step], ctx });
};
