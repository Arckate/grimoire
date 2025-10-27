import {
	constructorPlop,
	extractAllGeneratorsConfig,
	extractAllInitsConfig,
	extractAllStarter,
	findArgs,
	findSkippedParams,
	findStarterGeneratorConfig,
	mergeInitsConfig,
	mergeStarterConfig,
} from "@arckate/grimoire-core/cmd";
import { CONF_STARTERS, PLOP_FILE } from "@arckate/grimoire-core/const";
import type { CmdFn, StarterConfig } from "@arckate/grimoire-core/entities";
import {
	findConfig,
	findPlopPath,
	pathConstructor,
} from "@arckate/grimoire-core/path";
import { formatError, logError, logger } from "@arckate/grimoire-core/utils";

export const cmdStart: CmdFn = ({
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
		.description("Generate elements by file(json)")
		.argument("[string...]", "Arguments for the Starter")
		.option("--out <path>", "Path to generate files", process.cwd())
		.option("-f, --force", "force overwrites the existing file", false)
		.allowUnknownOption(true)
		.action(async (defaultArgs, { force, out: outPath }, command) => {
			try {
				const configPath = findPlopPath({
					dir,
					defaultDir,
					namePlopFile: config.plop || PLOP_FILE,
				});
				const allStarterConfig = await findConfig<StarterConfig>({
					dir,
					defaultDir,
					nameConfigFile: config.config || CONF_STARTERS,
				});

				const initsConfig = mergeInitsConfig(
					extractAllInitsConfig(allStarterConfig),
				);
				const generatorsConfig = findStarterGeneratorConfig(
					extractAllGeneratorsConfig(allStarterConfig),
				);
				const starterConfig = mergeStarterConfig(
					extractAllStarter(allStarterConfig),
				);

				const rawArgs = findSkippedParams(program, command);
				const args = findArgs(defaultArgs, rawArgs);

				const dest = await pathConstructor(outPath);
				stopSpinner();
				await constructorPlop({
					args,
					configPath,
					generatorsConfig,
					initsConfig,
					starterConfig,
					force,
					dest,
					processTerm,
				});
				processTerm.exit(0);
			} catch (anyError) {
				logger({ processTerm, args: [""] });
				const error = formatError(anyError);
				logError({ processTerm, error });
				processTerm.exit(1);
			}
		});
};
