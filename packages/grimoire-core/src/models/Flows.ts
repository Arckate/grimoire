import type {
	ConstructorFn,
	Constructors,
	LooseConstructors,
} from "./Constructor";

export type WorkflowStepParams<T> = T extends {
	constrFn: ConstructorFn<infer P>;
}
	? P
	: never;

export type WorkflowStep<
	TConstructors extends Constructors = LooseConstructors,
> = {
	[K in keyof TConstructors]: {
		ctorKey: K;
	} & WorkflowStepParams<TConstructors[K]>;
}[keyof TConstructors];

export type Workflow<TConstructors extends Constructors = Constructors> =
	Record<`step${number}`, WorkflowStep<TConstructors>>;

export interface FlowsConfig<
	TConstructors extends Constructors = Constructors,
> {
	constructors: TConstructors;
	workflows: Record<string, Workflow<TConstructors>>;
}
