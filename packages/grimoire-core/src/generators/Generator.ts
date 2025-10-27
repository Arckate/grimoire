import { Action } from "~/actions";
import { type IResult, Results } from "~/engine";
import type {
	ActionFn,
	ActionResult,
	ActionsGenConfig,
	Comment,
	EngineData,
	GeneratorFnConfig,
	ProcessTerm,
	PromptFn,
} from "~/models";
import { GeneratorError } from "~/errors";
import { Prompt } from "~/prompts";

interface GeneratorConstruct<TPrompts, TAction, TGeneratorFn> {
	processTerm: ProcessTerm;
	actions: TAction;
	prompts: TPrompts;
	data: EngineData;
	tools: Record<string, Record<string, any>>;
	generator: TGeneratorFn;
}

export class Generator<
	TPrompts extends Record<string, PromptFn>,
	TAction extends Record<string, ActionFn>,
	TGeneratorFn extends Partial<
		GeneratorFnConfig<Record<string, PromptFn>, Record<string, ActionFn>>
	>,
> {
	private processTerm: ProcessTerm;
	private generator: TGeneratorFn;
	private actions: TAction;
	private prompts: TPrompts;
	private data: EngineData;
	private tools: Record<string, Record<string, any>>;

	constructor({
		processTerm,
		data,
		prompts,
		actions,
		tools,
		generator,
	}: GeneratorConstruct<TPrompts, TAction, TGeneratorFn>) {
		this.processTerm = processTerm;
		this.data = data;
		this.prompts = prompts;
		this.actions = actions;
		this.tools = tools;
		this.generator = generator;
	}

	private static manageErrors(error: any) {
		if (typeof error === "string") {
			throw new GeneratorError(error);
		} else if (error instanceof Error) {
			throw new GeneratorError(error.message, error);
		} else {
			throw new GeneratorError("internal error");
		}
	}

	public static init<
		P extends Record<string, PromptFn>,
		A extends Record<string, ActionFn>,
		G extends Partial<
			GeneratorFnConfig<Record<string, PromptFn>, Record<string, ActionFn>>
		>,
	>(params: GeneratorConstruct<P, A, G>): Generator<P, A, G> {
		try {
			return new Generator(params);
		} catch (error) {
			Generator.manageErrors(error);
		}
	}

	public async runPrompts(
		processTerm: ProcessTerm,
		customData: Record<string, any> = {},
		bypass: string[] | Record<string, string>,
	): Promise<IResult<Record<string, any>>> {
		try {
			this.data.custom = { ...this.data.custom, ...customData };
			const prompts = this.generator.prompts;
			const prompt = Prompt.init({
				processTerm: processTerm || this.processTerm,
				prompts: this.prompts,
				data: this.data,
				bypass,
			});
			if (typeof prompts === "function") {
				await prompts(prompt);
			} else {
				await prompt.run(prompts);
			}
			return prompt.getData();
		} catch (error) {
			return Promise.resolve(
				Results.returnError(
					"Generator: runPrompts()",
					`in catch runPrompts: ${error}`,
					{},
				),
			);
		}
	}

	public runActions(
		answer: Record<string, any> = {},
		customData: Record<string, any> = {},
	): Promise<
		IResult<
			IResult<ActionResult<TAction>>[] | Comment<ActionsGenConfig<TAction>>
		>
	> {
		try {
			this.data.custom = { ...this.data.custom, ...customData };
			this.data.answer = answer;
			const actions = this.generator.actions;
			const action = Action.init({
				tools: this.tools,
				actions: this.actions,
				data: this.data,
			});
			if (typeof actions === "function") {
				return actions(action);
			}
			return action.run(actions);
		} catch (error) {
			return Promise.resolve(
				Results.returnError(
					"Generator: runActions()",
					`in catch runActions: ${error}`,
					{ values: [] },
				),
			);
		}
	}
}
