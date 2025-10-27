import {
	cmdPlop,
	findArgs,
	findSkippedParams,
	mergeInitsConfig,
} from "@arckate/grimoire-core/cmd";
import { getGlobalConfig, setInits } from "@arckate/grimoire-core/config";
import {
	CONF_INITS,
	DEFAULT_INIT,
	INIT_PLOP_FILE,
} from "@arckate/grimoire-core/const";
import type { CmdFn, InitsConfig } from "@arckate/grimoire-core/entities";
import {
	findConfig,
	findPlopPath,
	pathConstructor,
} from "@arckate/grimoire-core/path";
import { formatError, logError, logger } from "@arckate/grimoire-core/utils";

export const cmdInit: CmdFn = async ({
	program,
	name,
	config,
	dir,
	stopSpinner,
	defaultDir,
	processTerm,
}) => {
	program
		.command(name)
		.description("initialize cli ")
		.argument("[string...]", "Arguments for the generator")
		.option("-f, --force", "force overwrites the existing file", false)
		.option("--out <path>", "Path to generate files", process.cwd())
		.option(
			"-p, --ignore-prompts",
			"Ignore check args by run plop prompts.",
			false,
		)
		.allowUnknownOption(true)
		.action(
			async (defaultArgs, { force, out: outPath, ignorePrompts }, command) => {
				try {
					const configPath = findPlopPath({
						dir,
						defaultDir,
						namePlopFile: config.plop || INIT_PLOP_FILE,
					});
					const AllInitsConfig = await findConfig<InitsConfig>({
						dir,
						defaultDir,
						nameConfigFile: config.config || CONF_INITS,
					});
					const initsConfig = mergeInitsConfig(AllInitsConfig);
					const rawArgs = findSkippedParams(program, command);
					const args = findArgs(defaultArgs, rawArgs);

					stopSpinner();
					setInits(initsConfig);
					const dest = await pathConstructor(outPath);
					await cmdPlop({
						args: args.length
							? args
							: [
									DEFAULT_INIT,
									getGlobalConfig().configFileExt,
									getGlobalConfig().configFileType,
								],
						configPath: configPath,
						force,
						processTerm,
						dest,
						ignorePrompts,
					});
					processTerm.exit(0);
				} catch (anyError) {
					logger({ processTerm, args: [""] });
					const error = formatError(anyError);
					logError({ processTerm, error });
					processTerm.exit(1);
				}
			},
		);
};
