import { CONF_INITS } from "@arckate/grimoire-core/const";
import type { CmdFn, Generators } from "@arckate/grimoire-core/models";
import {
	findArgs,
	findSkippedParams,
	loadGlobals,
	runGen,
} from "@arckate/grimoire-core/handler";
import { pathConstructor } from "@arckate/grimoire-core/path";
import { formatError } from "@arckate/grimoire-core/utils";

export const cmdGenInit: CmdFn = ({
	program,
	name,
	configKey,
	cli,
	stopSpinner,
}) => {
	const processTerm = cli.getProcessTerm();
	program
		.command(name)
		.description("initialize cli")
		.argument("[string...]", "Arguments for the generator")
		.option("--out <path>", "Path to generate files", processTerm.cwd())
		.option("-f, --force", "force overwrites the existing file", false)
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
				{ force, out: outPath, global: inlineGlobals, globalsFile },
				command,
			) => {
				try {
					stopSpinner();

					await loadGlobals(cli, { globalsFile, inlineGlobals });

					const rawArgs = findSkippedParams(program, command);
					const args = findArgs(defaultArgs, rawArgs);

					const generators = cli.getConfCmd<Generators>(
						configKey || CONF_INITS,
					).config;
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
