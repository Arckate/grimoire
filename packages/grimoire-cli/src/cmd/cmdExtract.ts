import {
	cmdPlop,
	findArgs,
	findSkippedParams,
	mergeExtractsConfig,
} from "@arckate/grimoire-core/cmd";
import { setDirs, setExtracts } from "@arckate/grimoire-core/config";
import {
	CONF_EXTRACTS,
	DIRS,
	INIT_PLOP_FILE,
} from "@arckate/grimoire-core/const";
import type { CmdFn, ExtractsConfig } from "@arckate/grimoire-core/entities";
import {
	findConfig,
	findPlopPath,
	pathConstructor,
} from "@arckate/grimoire-core/path";
import { formatError, logError, logger } from "@arckate/grimoire-core/utils";

export const cmdExtract: CmdFn = ({
	program,
	name,
	config,
	dir,
	defaultDir,
	stopSpinner,
	processTerm,
}) => {
	program
		.command(name)
		.description("Create new single element by plop generator")
		.argument("[string...]", "Arguments for the generator")
		.option("--out <path>", "Path to generate files", process.cwd())
		.option("--in <path>", "Path to extract file or folder")
		.option("-f, --force", "force overwrites the existing file", false)
		.allowUnknownOption(true)
		.action(
			async (defaultArgs, { force, out: outPath, in: inPath }, command) => {
				try {
					const configPath = findPlopPath({
						dir,
						defaultDir,
						namePlopFile: config.plop || INIT_PLOP_FILE,
					});
					const AllGeneratorsConfig = await findConfig<ExtractsConfig>({
						dir,
						defaultDir,
						nameConfigFile: config.config || CONF_EXTRACTS,
					});
					const extracts = mergeExtractsConfig(AllGeneratorsConfig);
					const rawArgs = findSkippedParams(program, command);
					const args = findArgs(defaultArgs, rawArgs);
					stopSpinner();
					setDirs({ [DIRS.IN_PATH]: inPath });
					setExtracts(extracts);
					const dest = await pathConstructor(outPath);
					await cmdPlop({ args, configPath, dest, force, processTerm });
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
