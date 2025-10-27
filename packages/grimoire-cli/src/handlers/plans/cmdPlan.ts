import { CONF_GENERATORS } from "@arckate/grimoire-core/const";
import type {
	CmdFn,
	GeneratorsSubConfig,
} from "@arckate/grimoire-core/models";
import {
	findPlanFileArgs,
	loadPatches,
	runDeepPlan,
	runGen,
} from "@arckate/grimoire-core/handler";
import { findParentConfig, pathConstructor } from "@arckate/grimoire-core/path";
import { formatError } from "@arckate/grimoire-core/utils";

export const cmdPlan: CmdFn = ({
	program,
	name,
	configKey,
	cli,
	stopSpinner,
}) => {
	const processTerm = cli.getProcessTerm();
	program
		.command(name)
		.description("Generate elements by file(json)")
		.option("--out <path>", "Path to generate files")
		.option("--in <path>", 'Path to "gen.json" file or folder')
		.option("-f, --force", "force overwrites the existing file", false)
		.option("-d, --deep", 'use "genLink" params in ".plan.json"', false)
		.option(
			"-i, --ignore-dest",
			'Ignore the "genDest" key by default in the ".plan.json" file.',
			false,
		)
		.option("-t, --type-gen <path>", "choice type generators filter")
		.option("-p, --patch <path>", "Path to a patches file (.js or .json)")
		.action(
			async ({
				typeGen,
				in: inPath,
				out: outPath,
				force,
				deep,
				ignoreDest,
				patch: patchPath,
			}) => {
				try {
					const parentConfig = findParentConfig(cli);
					const patches = patchPath ? await loadPatches(cli, patchPath) : null;
					stopSpinner();
					const argsList = await findPlanFileArgs({
						cli,
						inPath,
						parentConfig,
					});
					const dest = await pathConstructor(cli, outPath);
					await runDeepPlan({
						cli,
						argsList,
						generatorsConfig: cli.getConfCmd<GeneratorsSubConfig>(
							configKey || CONF_GENERATORS,
						).config,
						force,
						deep,
						dest,
						ignoreDest,
						typeGen,
						parentConfig,
						...(patches ? { patches } : {}),
						genFn: async (params) => {
							cli.addGlobals({ dest: params.dest, planName: params.planName });
							await runGen({
								args: params.args,
								generators: params.generators,
								cli: params.cli,
								force: params.force,
							});
						},
					});

					processTerm.exit(0);
				} catch (anyError) {
					const { cliLogger, cliLoggerError } = cli.getPrompts();
					cliLogger({ message: "", keyValue: "", config: { args: [""] }, processTerm });
					const error = formatError(anyError);
					cliLoggerError({ message: "", keyValue: "", config: { error }, processTerm });
					processTerm.exit(1);
				}
			},
		);
};
