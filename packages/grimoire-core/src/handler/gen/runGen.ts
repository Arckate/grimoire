import type { Cli } from "~/Cli";
import { Engine } from "~/engine";
import type { Generators } from "~/models";

import { formatArgs } from "../formatArgs";
import { toResultItems } from "./toResultItems";

interface RunGenParams {
	args: string[] | [string, Record<string, string>];
	generators: Generators;
	cli: Cli;
	force?: boolean;
}

export const runGen = async ({
	args: [genName, ...newArgs],
	cli,
	generators,
	force = false,
}: RunGenParams): Promise<boolean> => {
	const processTerm = cli.getProcessTerm();
	const { cliSearchGenerator, cliResult } = cli.getPrompts();

	const engine = Engine.init({ ...cli.getDataEngine(), force });
	engine.setGenerators(generators);

	const searchResult = await cliSearchGenerator({
		message: "Please choose a generator",
		keyValue: "generator",
		config: {
			isValid: Boolean(genName && generators[genName]),
			list: engine.getGeneratorList(),
		},
		defaultValue: genName || "",
		processTerm,
	});

	const generator = engine.getGenerator(searchResult.generator);
	const bypass = formatArgs(newArgs);

	const promptResult = await generator.runPrompts(processTerm, {}, bypass);

	const finalResult = await promptResult.ThenAsync((data) =>
		generator.runActions(data),
	);

	const { result, items } = toResultItems(finalResult);
	cliResult({ message: "", keyValue: "", config: { items }, processTerm });
	return result;
};
