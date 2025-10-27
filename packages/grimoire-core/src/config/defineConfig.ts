import type {
	ConfCmd,
	Config,
	InfoConfig,
	UtilsConfig,
} from "~/models/Config";

export const defineConfig = <TConfCmds extends Record<string, ConfCmd>>(
	config: Partial<InfoConfig> & Partial<UtilsConfig<TConfCmds>>,
): Config<TConfCmds> => config;
