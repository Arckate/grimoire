import type { EngineData } from "./Engine";

export type ActionConfig<T> = T;

interface ActionFnParams<T> {
	config: T;
	tools: Record<string, Record<string, any>>;
	data: EngineData;
}

export type ActionFn<
	T extends ActionConfig<Record<string, any>> = ActionConfig<
		Record<string, any>
	>,
> = (
	params: ActionFnParams<T>,
) => Promise<Record<string, any>> | Record<string, any>;
