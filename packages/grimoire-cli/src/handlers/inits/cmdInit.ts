import { CONF_INITS, DEFAULT_INIT } from "@arckate/grimoire-core/const";
import type { CmdFn, Generators } from "@arckate/grimoire-core/models";
import { loadGlobals, runGen } from "@arckate/grimoire-core/handler";
import { pathConstructor } from "@arckate/grimoire-core/path";
import { formatError } from "@arckate/grimoire-core/utils";

export const cmdInit: CmdFn = ({
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
		.option("--out <path>", "Path to generate files", processTerm.cwd())
		.option("-f, --force", "force overwrites the existing file", false)
		.action(
			async ({ force, out: outPath, global: inlineGlobals, globalsFile }) => {
				try {
					stopSpinner();

					await loadGlobals(cli, { globalsFile, inlineGlobals });
					const config = cli.getConfig();

					const generators = cli.getConfCmd<Generators>(
						configKey || CONF_INITS,
					).config;
					cli.addGlobals({ dest: await pathConstructor(cli, outPath) });
					cli.addDirs({ cwd: processTerm.cwd() });
					await runGen({
						args: [DEFAULT_INIT, config.configFileExt, config.configFileType],
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
