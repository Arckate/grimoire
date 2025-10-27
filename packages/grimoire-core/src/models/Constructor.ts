import type { Cli } from "~/Cli";
import type { ConfCmd, FlowsConfig, WorkflowStep } from "~/models";

export interface RunCtor<
	TConstructors extends Constructors = LooseConstructors,
> {
	steps: WorkflowStep<TConstructors>[];
	ctx: ConstructorContext;
}

export type ConstructorFnReturn<
	TConstructors extends Constructors = LooseConstructors,
> = undefined | RunCtor<TConstructors>;

export interface ConstructorContext<
	TConfCmds extends Record<string, ConfCmd> = Record<string, ConfCmd>,
> {
	cli: Cli<
		Record<string, any>,
		Record<string, any>,
		Record<string, any>,
		TConfCmds
	>;
	args: string[] | Record<string, string>;
	force: boolean;
	dest: string;
	nameSpace: string;
	filters: Record<string, string>;
	flowsConfig: FlowsConfig;
}

export type ConstructorFn<
	TParams = Record<string, unknown>,
	TConfCmds extends Record<string, ConfCmd> = Record<string, ConfCmd>,
	TConstructors extends Constructors = LooseConstructors,
> = (
	configKey: string,
	params: TParams,
	context: ConstructorContext<TConfCmds>,
) =>
	| Promise<ConstructorFnReturn<TConstructors>>
	| ConstructorFnReturn<TConstructors>
	| Promise<void>
	| void;

export type Constructors = Record<
	string,
	{ constrFn: ConstructorFn<never>; configKey?: string }
>;

export type LooseConstructors = Record<
	string,
	{ constrFn: ConstructorFn<Record<string, unknown>>; configKey?: string }
>;

export type RunCtorOf<T extends ConstructorFn<any, any, any>> =
	T extends ConstructorFn<any, any, infer TConstructors>
		? RunCtor<TConstructors>
		: never;

export type StepOf<T extends ConstructorFn<any, any, any>> =
	RunCtorOf<T>["steps"][number];
