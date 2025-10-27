import { SKIP_PARAMS_VALUE } from "~/const";
import { type IResult, Results } from "~/engine";
import type {
	Comment,
	EngineData,
	ProcessTerm,
	PromptFn,
	PromptResult,
	PromptsGenConfig,
} from "~/models";
import { formatError } from "~/utils";

interface PromptConstruct<TPrompts> {
	processTerm: ProcessTerm;
	prompts: TPrompts;
	data: EngineData;
	bypass: string[] | Record<string, string>;
}

export class Prompt<TPrompts extends Record<string, PromptFn>> {
	private processTerm: ProcessTerm;
	private prompts: TPrompts;
	private data: EngineData;
	private bypass: string[] | Record<string, string>;
	private hasError: boolean = false;
	private doc: Comment<PromptsGenConfig<TPrompts>> | null;
	private results: IResult<PromptResult<TPrompts>>[] = [];

	private constructor({
		processTerm,
		prompts,
		data,
		bypass,
	}: PromptConstruct<TPrompts>) {
		this.processTerm = processTerm;
		this.data = data;
		this.prompts = prompts;
		this.bypass = bypass;
	}

	static init<T extends Record<string, PromptFn>>(
		params: PromptConstruct<T>,
	): Prompt<T> {
		return new Prompt<T>(params);
	}

	private findDefaultValue(keyValue: string) {
		if (Array.isArray(this.bypass)) {
			if (this.bypass.length) {
				const defaultValue = this.bypass.shift();
				if (defaultValue !== SKIP_PARAMS_VALUE) {
					return defaultValue;
				}
			}
			return "";
		}

		if (this.bypass[keyValue]) {
			return this.bypass[keyValue];
		}
		return "";
	}

	public async once({
		type,
		keyValue,
		message,
		defaultValue,
		when,
		...config
	}: PromptsGenConfig<TPrompts>): Promise<IResult<PromptResult<TPrompts>>[]> {
		if(when && !when(this.data)){
			return Promise.resolve(this.results);
		}
		try {
			const value = this.findDefaultValue(keyValue);
			const result = this.prompts[type]({
				keyValue,
				message,
				defaultValue,
				config,
				processTerm: this.processTerm,
				data: this.data,
				value,
			});
			if (result instanceof Promise) {
				const res = await result;
				this.results.push(
					Results.returnResponse("Prompt: once", {
						type,
						name: keyValue,
						value: res,
					}),
				);
			} else {
				this.results.push(
					Results.returnResponse("Prompt: once", {
						type,
						name: keyValue,
						value: result,
					}),
				);
			}
		} catch (err) {
			const error = formatError(err);
			this.hasError = true;
			this.results.push(
				Results.returnError("Prompt: once", error.message, {
					type,
					name: keyValue,
				}),
			);
		}
		return Promise.resolve(this.results);
	}

	public list(
		configs: PromptsGenConfig<TPrompts>[],
	): Promise<IResult<PromptResult<TPrompts>>[]> {
		let count = 0;

		while (this.hasError && count === configs.length - 1) {
			this.once(configs[count]);
			count++;
		}
		return Promise.resolve(this.results);
	}

	public async return(
		findDoc: boolean = false,
	): Promise<
		IResult<
			IResult<PromptResult<TPrompts>>[] | Comment<PromptsGenConfig<TPrompts>>
		>
	> {
		if (findDoc) {
			if (!this.doc) {
				Results.returnResponse("Prompt: return doc", {
					comment: "No documentation was provided for these prompts.",
					values: [],
				});
			}
			return Results.returnResponse("Prompt: return doc", this.doc);
		}

		return Results.returnResponse("Prompt: return result", this.results);
	}

	public getData(): IResult<Record<string, any>> {
		if (this.hasError) {
			return Results.returnError("Prompt: getData", "prompt has errors", {});
		}
		const answers = this.results.reduce(
			(acc, r) => {
				const inner = r.GetResult();
				if (inner.status === "OK") {
					acc[inner.data.name] = inner.data.value;
				}
				return acc;
			},
			{} as Record<string, any>,
		);
		return Results.returnResponse("Prompt: getData", answers);
	}

	public setDoc(
		doc: PromptsGenConfig<TPrompts>[] | Comment<PromptsGenConfig<TPrompts>>,
	): void {
		if (Array.isArray(doc)) {
			this.doc = {
				values: doc,
			};
			return;
		}
		this.doc = doc;
	}

	public async run(
		configs: PromptsGenConfig<TPrompts>[],
		findDoc: boolean = false,
	): Promise<
		IResult<
			IResult<PromptResult<TPrompts>>[] | Comment<PromptsGenConfig<TPrompts>>
		>
	> {
		this.setDoc(configs);
		await this.list(configs);
		return this.return(findDoc);
	}
}
