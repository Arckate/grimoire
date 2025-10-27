import type { ActionFn } from "./ActionFn";
import type { CmdFn } from "./CmdFn";
import type { PromptFn } from "./PromptFn";

type CmdConfig = {
	cmdFn?: CmdFn;
	configKey?: string;
};

export type RecordCamelCase<T extends string | number | symbol, U> = Record<
	T,
	U
>;

export interface ProcessorType {
	read: (path: string) => RecordCamelCase<string, string>;
	write: (path: string, data: RecordCamelCase<string, string>) => void;
	stringTo: (text: string) => RecordCamelCase<string, string>;
}

export type Processor = Record<string, Record<string, ProcessorType>>;

export interface TemplatingEngine {
	render: (
		template: string,
		data: Record<string, any>,
		options?: Record<string, any>,
	) => string;
	options?: Record<string, any>;
}

export type Templating = Record<string, TemplatingEngine>;

export interface InfoConfig {
	name: string;
	description: string;
	cliFolder: string;
	rootKey: string;
	dirnamesFile: string;
	version: string;
	configFile: string;
	configFileExt: string;
	configFileType: string;
	planExt: string;
	planType: string;
}

export interface ConfCmd<T = unknown> {
	config?: T;
	merge?: (oldValue: T, newValue: T) => T;
}

export interface UtilsConfig<
	TConfCmds extends Record<string, ConfCmd> = Record<string, ConfCmd>,
> {
	cmds: Record<string, CmdConfig>;
	confCmds: TConfCmds;
	actions: Record<string, ActionFn>;
	prompts: Record<string, PromptFn>;
	processor: Processor;
	templating: Templating;
	templateType: string;
	globals: Record<string, any>;
}

export type Config<
	TConfCmds extends Record<string, ConfCmd> = Record<string, ConfCmd>,
> = Partial<InfoConfig> & Partial<UtilsConfig<TConfCmds>>;
