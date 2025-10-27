import type { InitFn } from "@arckate/grimoire-core/entities";

const defaultInit: InitFn = ({
	findDir,
	config: { configFile, cliFolder, findFile },
}) => ({
	description: "init cli with setup default",
	prompts: [
		{
			type: "list",
			name: "ext",
			message: "What output extension do you want?",
			choices: Object.keys(findFile).map((key) => ({ name: key, value: key })),
		},
		{
			type: "input",
			name: "type",
			message: "Which property type should be returned?",
		},
	],
	actions: [
		{
			type: "addFolder",
			dest: cliFolder,
		},
		{
			type: "copyTo",
			src: findDir("templates/defaultInit/config.cli.json"),
			typeFileFrom: "camelCase",
			nameFileTo: configFile,
			extFileTo: "{{ext}}",
			typeFileTo: "{{type}}",
		},
	],
});

export default defaultInit;
