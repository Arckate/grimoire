import type {
	CustomActionFunction,
	NodePlopAPI,
	PlopGeneratorConfig,
} from "node-plop";

export interface ConfigSetup {
	helpers?: Record<string, Handlebars.HelperDelegate>;
	partials?: Record<string, string>;
	actions?: Record<string, CustomActionFunction>;
	prompts?: Record<string, Parameters<NodePlopAPI["setPrompt"]>[1]>;
}

type GeneratorsFn = (...findDir: any[]) => Partial<PlopGeneratorConfig>;

type Generators = Record<string, { generatorsFn: GeneratorsFn; params: any[] }>;

export type RecordCamelCase<T extends string | number | symbol, U> = Record<
	T,
	U
>;

export interface FileType {
	read: (path: string) => RecordCamelCase<string, string>;
	write: (path: string, data: RecordCamelCase<string, string>) => void;
}

export type FindFile = Record<string, Record<string, FileType>>;

export interface Config {
	generators: Generators;
	setup?: ConfigSetup;
	findFile?: FindFile;
}
