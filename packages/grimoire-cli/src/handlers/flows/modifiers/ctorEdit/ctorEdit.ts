import type {
	ConstructorContext,
	ConstructorFn,
	StepOf,
} from "@arckate/grimoire-core/models";
import { edit } from "./editValues";

export type CtorEditStep = StepOf<ConstructorFn<CtorEdit>>;

export interface CtorEdit {
	keys: Record<string, string | Record<string, string>>;
	value: CtorEditStep;
}

export const ctorEdit: ConstructorFn<CtorEdit> = async (
	_configKey,
	params,
	ctx: ConstructorContext,
) => {
	const args = Array.isArray(ctx.args) ? {} : ctx.args;
	const step = edit(
		params,
		ctx.nameSpace,
		args as Record<string, string>,
	);
	return Promise.resolve({ steps: [step], ctx });
};
