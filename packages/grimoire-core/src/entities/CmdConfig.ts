import type { CustomActionFunction, NodePlopAPI } from "node-plop";
import type { CmdFn } from "./CmdFn";

export interface CommandParams {
	plop?: string;
	config?: string;
}
type CommandCmdConfig = {
	cmdFn: CmdFn;
} & CommandParams;

export type RecordCamelCase<T extends string | number | symbol, U> = Record<
	T,
	U
>;
export interface FileType {
	read: (path: string) => RecordCamelCase<string, string>;
	write: (path: string, data: RecordCamelCase<string, string>) => void;
	stringTo: (text: string) => RecordCamelCase<string, string>;
}

export type FindFile = Record<string, Record<string, FileType>>;

export interface CmdInfoConfig {
	name: string;
	description: string;
	cliFolder: string;
	rootKey: string;
	dirnamesFile: string;
	version: string;
	configFile: string;
	configFileExt: string;
	configFileType: string;
	genFileExt: string;
	genFileType: string;
}

export interface CmdUtilsConfig {
	commands: Record<string, CommandCmdConfig>;
	helpers: Record<string, Handlebars.HelperDelegate>;
	partials: Record<string, string>;
	actions: Record<string, CustomActionFunction>;
	prompts: Record<string, Parameters<NodePlopAPI["setPrompt"]>[1]>;
	findFile: FindFile;
}

export type CmdConfig = Partial<CmdInfoConfig> & Partial<CmdUtilsConfig>;
