import { type IResult, Results } from "~/engine";
import type {
	ActionConfig,
	ActionFn,
	ActionResult,
	ActionsGenConfig,
	Comment,
	EngineData,
} from "~/models";
import { formatError } from "~/utils";

interface ActionConstruct<T> {
	tools: Record<string, Record<string, any>>;
	actions: T;
	data: EngineData;
}

export class Action<TAction extends Record<string, ActionFn>> {
	private actions: TAction;
	private tools: Record<string, Record<string, any>>;
	private data: EngineData;
	private hasError: boolean = false;
	private doc: Comment<ActionsGenConfig<TAction>> | null;
	private results: IResult<ActionResult<TAction>>[] = [];

	private constructor({ tools, actions, data }: ActionConstruct<TAction>) {
		this.actions = actions;
		this.tools = tools;
		this.data = data;
	}

	static init<T extends Record<string, ActionFn>>(
		params: ActionConstruct<T>,
	): Action<T> {
		return new Action<T>(params);
	}

	public async once({
		type,
		...configFn
	}: ActionsGenConfig<TAction>): Promise<IResult<ActionResult<TAction>>[]> {
		const config = configFn as unknown as ActionConfig<Record<string, any>>;
		try {
			const result = this.actions[type]({
				config: config as unknown as ActionConfig<Record<string, any>>,
				tools: this.tools,
				data: this.data,
			});
			if (result instanceof Promise) {
				const res = await result;
				this.results.push(
					Results.returnResponse("Action: once", {
						type,
						name: config.name,
						value: res,
					}),
				);
			} else {
				this.results.push(
					Results.returnResponse("Action: once", {
						type,
						name: config.name,
						value: result,
					}),
				);
			}
		} catch (err) {
			const error = formatError(err);
			this.hasError = true;
			this.results.push(
				Results.returnError("Action: once", error.message, {
					type,
					name: config.name,
				}),
			);
		}
		return Promise.resolve(this.results);
	}

	public async list(
		configs: ActionsGenConfig<TAction>[],
	): Promise<IResult<ActionResult<TAction>>[]> {
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
			IResult<ActionResult<TAction>>[] | Comment<ActionsGenConfig<TAction>>
		>
	> {
		if (findDoc) {
			if (!this.doc) {
				Results.returnResponse("Action: return doc", {
					comment: "No documentation was provided for these actions.",
					values: [],
				});
			}
			return Results.returnResponse("Action: return doc", this.doc);
		}

		return Results.returnResponse("Action: return result ", this.results);
	}

	public setDoc(
		doc: ActionsGenConfig<TAction>[] | Comment<ActionsGenConfig<TAction>>,
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
		configs: ActionsGenConfig<TAction>[],
		findDoc: boolean = false,
	): Promise<
		IResult<
			IResult<ActionResult<TAction>>[] | Comment<ActionsGenConfig<TAction>>
		>
	> {
		this.setDoc(configs);
		await this.list(configs);
		return this.return(findDoc);
	}
}
