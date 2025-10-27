import type { CmdInfoConfig } from "./CmdConfig";

export interface CmdUtilsInfoConfig {
	findFile: Record<string, string[]>;
}

export type FnConfig = CmdInfoConfig & CmdUtilsInfoConfig;
