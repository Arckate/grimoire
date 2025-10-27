import merge from "lodash.merge";
import type {
	ActionFn,
	AnyCli,
	CliDataEngine,
	EngineData,
	EngineInit,
	GeneratorFnConfig,
	GeneratorsFn,
	ProcessTerm,
	PromptFn,
} from "~/models";
import { EngineError } from "~/errors";
import { Generator } from "~/generators";

interface EngineConstruct {
	processTerm: ProcessTerm;
	data?: EngineData;
	actions?: Record<string, ActionFn>;
	prompts?: Record<string, PromptFn>;
	tools?: Record<string, Record<string, any>>;
	config?: Record<string, any>;
}

export class Engine<
	TPrompts extends Record<string, PromptFn> = Record<string, PromptFn>,
	TAction extends Record<string, ActionFn> = Record<string, ActionFn>,
	TGenerators extends Record<
		string,
		Partial<
			GeneratorFnConfig<Record<string, PromptFn>, Record<string, ActionFn>>
		>
	> = Record<
		string,
		Partial<
			GeneratorFnConfig<Record<string, PromptFn>, Record<string, ActionFn>>
		>
	>,
> {
	private processTerm: ProcessTerm;
	private actions: TAction = {} as TAction;
	private prompts: TPrompts = {} as TPrompts;
	private generators: TGenerators = {} as TGenerators;
	private data: EngineData;
	private tools: Record<string, Record<string, any>> = {};
	private config: Record<string, any> = {};

	private constructor({
		processTerm,
		data,
		actions,
		prompts,
		tools,
		config,
	}: EngineConstruct) {
		this.processTerm = processTerm;
		this.data = data;
		if (actions) this.actions = actions as TAction;
		if (prompts) this.prompts = prompts as TPrompts;
		if (tools) this.tools = tools;
		if (config) this.config = config;
	}

	private static manageErrors(error: any) {
		if (typeof error === "string") {
			throw new EngineError(error);
		} else if (error instanceof Error) {
			throw new EngineError(error.message, error);
		} else {
			throw new EngineError("internal error");
		}
	}

	public static init({
		processTerm: newProcessTerm = {},
		dest: newDest,
		force = false,
		globals = {},
		dirnames = {},
		custom = {},
		actions = {},
		prompts = {},
		tools = {},
		config = {},
	}: EngineInit): Engine {
		try {
			const processTerm = {
				stdin: process.stdin,
				stderr: process.stderr,
				stdout: process.stdout,
				exit: process.exit,
				cwd: process.cwd,
				...newProcessTerm,
			};

			const data = {
				dest: newDest || processTerm.cwd(),
				force,
				globals,
				dirnames,
				custom,
				answer: {},
			};

			return new Engine({ processTerm, data, actions, prompts, tools, config });
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public getConfig(): Record<string, any> {
		return this.config;
	}

	public setConfig(config: Record<string, any>) {
		try {
			this.config = { ...this.config, ...config };
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setDataGlobals(globals: Record<string, any>) {
		try {
			this.data.globals = { ...this.data.globals, ...globals };
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setDataForce(force: boolean) {
		try {
			this.data.force = force;
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setDataDest(dest: string) {
		try {
			this.data.dest = dest;
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setDataDirnames(dirnames: Record<string, any>) {
		try {
			this.data.dirnames = { ...this.data.dirnames, ...dirnames };
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setDataCustom(custom: Record<string, any>) {
		try {
			this.data.custom = { ...this.data.custom, ...custom };
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setAction<K extends string, F extends ActionFn>(
		name: K,
		action: F,
	): Engine<TPrompts, TAction & Record<K, F>, TGenerators> {
		try {
			(this.actions as any)[name] = action;
			return this as unknown as Engine<
				TPrompts,
				TAction & Record<K, F>,
				TGenerators
			>;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setPrompt<K extends string, F extends PromptFn>(
		name: K,
		prompt: F,
	): Engine<TPrompts & Record<K, F>, TAction, TGenerators> {
		try {
			(this.prompts as any)[name] = prompt;
			return this as unknown as Engine<
				TPrompts & Record<K, F>,
				TAction,
				TGenerators
			>;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	private getDataEngine(): CliDataEngine<AnyCli> {
		return {
			processTerm: this.processTerm,
			dest: this.data?.dest,
			globals: this.data?.globals ?? {},
			dirnames: this.data?.dirnames ?? {},
			actions: this.actions,
			prompts: this.prompts,
			tools: {
				templating: this.tools.templating ?? {},
				processor: this.tools.processor ?? {},
			},
			config: this.config,
			force: this.data?.force ?? false,
		};
	}

	public setGenerators(
		generators: Record<string, GeneratorsFn>,
		data?: Partial<CliDataEngine<AnyCli>>,
	): this {
		try {
			const mergedData = merge(this.getDataEngine(), data);
			Object.entries(generators).forEach(([name, fn]) => {
				(this.generators as Record<string, ReturnType<typeof fn>>)[name] =
					fn(mergedData);
			});
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setGenerator<K extends string, F extends PromptFn>(
		name: K,
		generator: F,
	): Engine<TPrompts, TAction, TGenerators & Record<K, F>> {
		try {
			(this.generators as any)[name] = generator;
			return this as unknown as Engine<
				TPrompts,
				TAction,
				TGenerators & Record<K, F>
			>;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setToolTemplating(name: string, templateEngine: any) {
		try {
			this.tools.templating[name] = templateEngine;
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public setTool(name: string, tools: any) {
		try {
			if (this.tools[name]) {
				this.tools[name] = { ...this.tools[name], ...tools };
			}
			this.tools[name] = tools;
			return this;
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public getGeneratorList() {
		try {
			return Object.entries(this.generators).map(([name, gen]) => ({
				name,
				description: gen.description,
			}));
		} catch (error) {
			Engine.manageErrors(error);
		}
	}

	public getGenerator<T extends keyof TGenerators = keyof TGenerators>(
		generatorName: T,
	): Generator<TPrompts, TAction, TGenerators[T]> {
		try {
			if (!this.generators[generatorName]) {
				throw new EngineError("generatorName doesn't exit in generators");
			}
			return Generator.init<TPrompts, TAction, TGenerators[T]>({
				processTerm: this.processTerm,
				data: this.data,
				prompts: this.prompts,
				actions: this.actions,
				tools: this.tools,
				generator: this.generators[generatorName],
			});
		} catch (error) {
			Engine.manageErrors(error);
		}
	}
}
