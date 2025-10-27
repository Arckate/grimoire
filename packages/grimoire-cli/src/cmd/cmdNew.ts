import {
	cmdPlop,
	findArgs,
	findGenerators,
	findSkippedParams,
	mergeGeneratorConfig,
} from "@arckate/grimoire-core/cmd";
import { setGenerators } from "@arckate/grimoire-core/config";
import { CONF_GENERATORS, PLOP_FILE } from "@arckate/grimoire-core/const";
import type { CmdFn, GeneratorsConfig } from "@arckate/grimoire-core/entities";
import {
	findConfig,
	findPlopPath,
	pathConstructor,
} from "@arckate/grimoire-core/path";
import { formatError, logError, logger } from "@arckate/grimoire-core/utils";

export const cmdNew: CmdFn = ({
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
		.option("-f, --force", "force overwrites the existing file", false)
		.option("-t, --type-gen <path>", "choice type generators filter")
		.option(
			"-p, --ignore-prompts",
			"Ignore check args by run plop prompts.",
			false,
		)
		.allowUnknownOption(true)
		.action(
			async (
				defaultArgs,
				{ force, out: outPath, typeGen, ignorePrompts },
				command,
			) => {
				try {
					const configPath = findPlopPath({
						dir,
						defaultDir,
						namePlopFile: config.plop || PLOP_FILE,
					});
					const AllGeneratorsConfig = await findConfig<GeneratorsConfig>({
						dir,
						defaultDir,
						nameConfigFile: config.config || CONF_GENERATORS,
					});
					const generatorsConfig = mergeGeneratorConfig(AllGeneratorsConfig);
					const rawArgs = findSkippedParams(program, command);
					const args = findArgs(defaultArgs, rawArgs);
					stopSpinner();
					const generators = await findGenerators({
						config: generatorsConfig,
						typeGen,
						processTerm,
					});
					setGenerators(generators);
					const dest = await pathConstructor(outPath);
					await cmdPlop({
						args,
						configPath,
						dest,
						force,
						processTerm,
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
