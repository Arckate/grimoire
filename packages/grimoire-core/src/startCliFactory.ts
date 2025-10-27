import { Command } from "commander";
import merge from "lodash.merge";
import ora from "ora";
import { setDirnames } from "./config/dirnames";
import { setDirs } from "./config/dirs";
import { setGlobalConfig } from "./config/global";
import { DESCRIPTION, DIRNAMES_FILE, NAME, VERSION } from "./const/config";
import type { CmdConfig } from "./entities/CmdConfig";
import { findConfig } from "./path/findConfig";
import { mergeDirnames } from "./path/mergeDirnames";
import { logger } from "./utils/logger";

export const startCliFactory =
	(defaultDir: string, oldConfig: CmdConfig) =>
	async (currentConfig: CmdConfig, dir: string) => {
		const processTerm = {
			stdin: process.stdin,
			stderr: process.stderr,
			stdout: process.stdout,
			exit: process.exit,
		};
		logger({ processTerm, args: [""] });
		const spinner = ora("Loading").start();
		setDirs({ dir, defaultDir });
		const config: CmdConfig = merge(oldConfig, currentConfig);
		setGlobalConfig(config);
		const program = new Command();

		const AllDirname = await findConfig<Record<string, string>>({
			dir,
			defaultDir,
			nameConfigFile: config.dirnamesFile || DIRNAMES_FILE,
		});

		const dirnames = mergeDirnames(AllDirname);
		setDirnames(dirnames);

		program
			.name(config.name || NAME)
			.description(config.description || DESCRIPTION)
			.version(config.version || VERSION);

		for (const [name, { cmdFn, ...params }] of Object.entries(
			config.commands || {},
		)) {
			cmdFn({
				program,
				name,
				config: params,
				dir,
				defaultDir,
				stopSpinner: () => spinner.stop(),
				processTerm,
			});
		}

		program.parse();
	};
