import type { Action } from "~/actions";
import type { IResult } from "~/engine";
import type { Prompt } from "~/prompts";
import type { ActionFn } from "./ActionFn";
import type { PromptConfig, PromptFn } from "./PromptFn";

export type PromptsGenConfig<TPrompts extends Record<string, PromptFn>> = {
	type: keyof TPrompts;
	when?: ((data: Record<string, any>) => boolean | Promise<boolean>);
} & PromptConfig & Parameters<TPrompts[keyof TPrompts]>[0]["config"];

export type ActionsGenConfig<TAction extends Record<string, ActionFn>> = {
	type: keyof TAction;
} & Parameters<TAction[keyof TAction]>[0];

export interface Comment<T> {
	comment?: string;
	values: (T | Comment<T>)[];
}

export interface PromptResult<TPrompts extends Record<string, PromptFn>> {
	type: keyof TPrompts;
	name: string;
	value?: Record<string, any>;
}

export interface ActionResult<TAction extends Record<string, ActionFn>> {
	type: keyof TAction;
	name: string;
	value?: Record<string, any>;
}

export type GeneratorFnConfig<
	TPrompts extends Record<string, PromptFn>,
	TAction extends Record<string, ActionFn>,
> = {
	description: string;
	dirs?: Record<string, string>;
	prompts:
		| PromptsGenConfig<TPrompts>[]
		| (<T extends TPrompts>(
				prompt: Prompt<T>,
		  ) => Promise<
				IResult<IResult<PromptResult<T>>[] | Comment<PromptsGenConfig<T>>>
		  >);
	actions:
		| ActionsGenConfig<TAction>[]
		| (<T extends TAction>(
				action: Action<T>,
		  ) => Promise<
				IResult<IResult<ActionResult<T>>[] | Comment<ActionsGenConfig<T>>>
		  >);
};
