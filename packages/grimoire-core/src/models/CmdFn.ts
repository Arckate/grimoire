import type { Command } from "commander";
import type { Cli } from "~/Cli";

interface CmdFnParams {
	program: Command;
	name: string;
	configKey: string;
	stopSpinner: () => void;
	cli: Cli;
}

export type CmdFn = (params: CmdFnParams) => void;
