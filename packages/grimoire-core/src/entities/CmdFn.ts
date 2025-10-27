import type { Command } from "commander";
import type { CommandParams } from "./CmdConfig";
import type { ProcessTerm } from "./ProcessTerm";

interface CmdFnParams {
	program: Command;
	name: string;
	config: CommandParams;
	dir: string;
	defaultDir: string;
	stopSpinner: () => void;
	processTerm: ProcessTerm;
}

export type CmdFn = (params: CmdFnParams) => void;
