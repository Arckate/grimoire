import { CONF_FLOWS } from "@arckate/grimoire-core/const";
import { findArgs, findSkippedParams, runFlow } from "@arckate/grimoire-core/handler";
import type { CmdFn, FlowsConfig } from "@arckate/grimoire-core/models";
import { pathConstructor } from "@arckate/grimoire-core/path";


export const cmdFlow: CmdFn = ({
	program,
	name,
	configKey,
	cli,
	stopSpinner,
}) => {
	const processTerm = cli.getProcessTerm();
	const prompt = cli.getPrompts();
	program
		.command(name)
		.description("Generate elements by file(json)")
		.argument("[string...]", "Arguments for the workflow")
		.option("--out <path>", "Path to generate files", processTerm.cwd())
		.option("-f, --force", "force overwrites the existing file", false)
		.allowUnknownOption(true)
		.action(async (defaultArgs, { force, out: outPath }, command) => {
			try {
				const rawArgs = findSkippedParams(program, command);
				const args = findArgs(defaultArgs, rawArgs);
				const dest = await pathConstructor(cli, outPath);

				stopSpinner();
				await runFlow({
					cli,
					args,
					flowsConfig: cli.getConfCmd<FlowsConfig>(configKey || CONF_FLOWS)
						.config,
					force,
					dest,
				});
				processTerm.exit(0);
			} catch (err) {
				prompt.cliLogger({ processTerm, args: [""] });
				const error = prompt.cliLoggerError(err);
				prompt.cliLoggerError({ processTerm, error });
				processTerm.exit(1);
			}
		});
};

