import type { GeneratorsConfig } from "./Generators";
import type { InitsConfig } from "./Inits";

export interface CmdPlopParams {
	typeGen?: string;
	generator: string;
	params?: Record<string, string>;
	out?: string;
	force?: boolean;
	ignorePrompts?: boolean;
}

export interface CmdInitParams {
	initGenerator: string;
	params?: Record<string, string>;
	out?: string;
	force?: boolean;
	ignorePrompts?: boolean;
}

export interface FilePlopParams {
	typeGen?: string;
	in: string;
	out?: string;
	force?: boolean;
	deep?: boolean;
	ignoreDest?: boolean;
}

export interface StarterLink {
	starterName: string;
	nameSpace: string;
}

export interface MultiChoice {
	question: string;
	name: string;
	values:
		| Record<
				string,
				CmdPlopParams | FilePlopParams | StarterLink | CmdInitParams
		  >
		| Record<string, string>
		| Filter<
				| Record<
						string,
						CmdPlopParams | FilePlopParams | StarterLink | CmdInitParams
				  >
				| Record<string, string>
		  >;
}

export interface Filter<T = unknown> {
	keyFilter: string;
	defaultFilter: string;
	values: Record<string, T>;
}
export type StarterParams =
	| CmdPlopParams
	| CmdInitParams
	| FilePlopParams
	| MultiChoice
	| StarterLink
	| Filter<CmdPlopParams | FilePlopParams | StarterLink | CmdInitParams>;

export type Starters = Record<`step${number}`, StarterParams>;

export interface StarterConfig extends Record<string, unknown> {
	inits: InitsConfig;
	generators: GeneratorsConfig;
	starters: Record<string, Starters>;
}
