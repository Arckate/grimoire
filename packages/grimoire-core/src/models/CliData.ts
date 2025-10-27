import type { Cli } from "~/Cli";
import type { Config } from "./Config";

// actions et prompts en Record<string, any> le temps de la migration hors Plop
export type AnyCli = Cli<
	NonNullable<Config["globals"]>,
	Record<string, any>,
	Record<string, any>,
	NonNullable<Config["confCmds"]>,
	Config,
	Record<string, string>
>;

export type CliDataEngine<TCli extends AnyCli> = {
	processTerm: ReturnType<TCli["getProcessTerm"]>;
	dest: string;
	globals: ReturnType<TCli["getGlobals"]>;
	dirnames: ReturnType<TCli["getDirs"]>;
	actions: ReturnType<TCli["getActions"]>;
	prompts: ReturnType<TCli["getPrompts"]>;
	tools: {
		templating: Record<string, any>;
		processor: Record<string, any>;
	};
	config: ReturnType<TCli["getConfig"]>;
	force: boolean;
};
