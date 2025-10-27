import type { EngineData, ProcessTerm } from "~/models";

export type PromptConfig = {
	message: string;
	keyValue: string;
	defaultValue?: any | ((data: Record<string, any>) => any | Promise<any>);
};

export interface PromptFnParams<T extends Record<string, any> = Record<string, any>> extends PromptConfig {
	config: T;
	processTerm: ProcessTerm;
	data?: EngineData;
	value?: string;
}

export type PromptFn<
	T extends Record<string, any> = Record<string, any>,
> = (params: PromptFnParams<T>) => Promise<any> | any;
