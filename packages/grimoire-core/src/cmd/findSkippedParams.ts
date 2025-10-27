import type { Command } from "commander";
import { REG_CMD_OPTION_VALUE, REG_CMD_SKIP_PARAMS_KEY } from "~/const/regexp";
import { SKIP_PARAMS_KEY } from "~/const/skippedParams";

const findOptions = (command: any): string[] => {
	const options = command.options;
	options.push(command._helpOption);
	return options.flatMap(({ flags }) =>
		flags.replace(REG_CMD_OPTION_VALUE, "").trim().split(", "),
	);
};

const sanitizeArgs = (
	rawArgs: string[],
	options: string[],
): Record<string, string> => {
	const args = [...rawArgs];
	options.forEach((option) => {
		const optionExist = args.indexOf(option);
		if (optionExist !== -1) {
			const nextOptionIndex = args.findIndex(
				(el, i) => i > optionExist && el.startsWith(SKIP_PARAMS_KEY),
			);
			if (nextOptionIndex === -1) {
				args.splice(optionExist, 1);
			} else {
				args.splice(optionExist, nextOptionIndex - optionExist);
			}
		}
	});
	const cleanArgs = args.reduce<Record<string, string>>(
		(acc, arg, index, oldArgs) => {
			if (
				arg.startsWith(SKIP_PARAMS_KEY) &&
				oldArgs[index + 1] &&
				!oldArgs[index + 1].startsWith(SKIP_PARAMS_KEY)
			) {
				acc[arg.replace(REG_CMD_SKIP_PARAMS_KEY, "")] = oldArgs[index + 1];
			}
			return acc;
		},
		{},
	);
	return cleanArgs;
};

export const findSkippedParams = (
	program: Command,
	command?: any,
): Record<string, string> => {
	let rawArgs = program.parseOptions(process.argv).unknown;
	const cmdRawArgs = command?.parent?.rawArgs;
	if (!rawArgs.length && cmdRawArgs.length) {
		rawArgs = cmdRawArgs;
	}
	const separatorIndex = rawArgs.indexOf(SKIP_PARAMS_KEY);
	const rawArgsSkipped =
		separatorIndex !== -1 ? rawArgs.slice(separatorIndex + 1) : rawArgs;

	const options = findOptions(command);
	return sanitizeArgs(rawArgsSkipped, options);
};
