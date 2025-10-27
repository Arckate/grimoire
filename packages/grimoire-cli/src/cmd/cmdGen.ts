import {
	deepFilePlop,
	findFilePlopArgs,
	mergeGeneratorConfig,
} from "@arckate/grimoire-core/cmd";
import { CONF_GENERATORS, PLOP_FILE } from "@arckate/grimoire-core/const";
import type { CmdFn, GeneratorsConfig } from "@arckate/grimoire-core/entities";
import {
	findConfig,
	findParentConfig,
	findPlopPath,
	pathConstructor,
} from "@arckate/grimoire-core/path";
import { formatError, logError, logger } from "@arckate/grimoire-core/utils";

export const cmdGen: CmdFn = ({
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
		.option("--out <path>", "Path to generate files")
		.option("--in <path>", 'Path to "gen.json" file or folder')
		.option("-f, --force", "force overwrites the existing file", false)
		.option("-d, --deep", 'use "genLink" params in ".gen.json"', false)
		.option(
			"-i, --ignore-dest",
			'Ignore the "genDest" key by default in the ".gen.json" file.',
			false,
		)
		.option("-t, --type-gen <path>", "choice type generators filter")
		.action(
			async ({
				typeGen,
				in: inPath,
				out: outPath,
				force,
				deep,
				ignoreDest,
			}) => {
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
					const parentConfig = findParentConfig();
					const generatorsConfig = mergeGeneratorConfig(AllGeneratorsConfig);
					stopSpinner();
					await findFilePlopArgs({
						processTerm,
						inPath,
						parentConfig,
						filePlopFn: async (argsList) => {
							const dest = await pathConstructor(outPath);
							await deepFilePlop({
								argsList,
								configPath,
								force,
								deep,
								dest,
								ignoreDest,
								generatorsConfig,
								typeGen,
								processTerm,
								parentConfig,
							});
						},
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
