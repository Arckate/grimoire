import { CONF_GENERATORS } from "@arckate/grimoire-core/const";
import type {
	CmdFn,
	GeneratorsSubConfig,
} from "@arckate/grimoire-core/models";
import {
	findArgs,
	findGenerators,
	findSkippedParams,
	loadGlobals,
	runGen,
} from "@arckate/grimoire-core/handler";
import { pathConstructor } from "@arckate/grimoire-core/path";
import { formatError } from "@arckate/grimoire-core/utils";

export const cmdGen: CmdFn = ({
	program,
	name,
	configKey,
	cli,
	stopSpinner,
}) => {
	const processTerm = cli.getProcessTerm();
	program
		.command(name)
		.description("Create new single element by generator")
		.argument("[string...]", "Arguments for the generator")
		.option("--out <path>", "Path to generate files", processTerm.cwd())
		.option("-f, --force", "force overwrites the existing file", false)
		.option("-t, --type-gen <path>", "choice type generators filter")
		.option(
			"-g, --global <key=value>",
			"inline global variable (repeatable)",
			(v, acc: string[]) => [...acc, v],
			[],
		)
		.option(
			"--globals-file <path>",
			"path to a JS/TS/JSON file exporting globals",
		)
		.allowUnknownOption(true)
		.action(
			async (
				defaultArgs,
				{ force, out: outPath, typeGen, global: inlineGlobals, globalsFile },
				command,
			) => {
				try {
					stopSpinner();

					await loadGlobals(cli, { globalsFile, inlineGlobals });

					const rawArgs = findSkippedParams(program, command);
					const args = findArgs(defaultArgs, rawArgs);

					const generators = await findGenerators({
						cli,
						config: cli.getConfCmd<GeneratorsSubConfig>(
							configKey || CONF_GENERATORS,
						).config,
						typeGen,
					});
					cli.addGlobals({ dest: await pathConstructor(cli, outPath) });
					cli.addDirs({ cwd: processTerm.cwd() });
					await runGen({
						args,
						generators,
						cli,
						force,
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
