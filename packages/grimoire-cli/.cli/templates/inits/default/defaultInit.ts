import type { GeneratorsFn } from "@arckate/grimoire-core/models";

const defaultInit: GeneratorsFn = ({ config } = {} as any) => ({
	description: "init cli with setup default",
	prompts: [
		{
			type: "list",
			keyValue: "ext",
			message: "What output extension do you want?",
			choices: Object.keys(config.processor || {}).map((key) => ({
				name: key,
				value: key,
			})),
		},
		{
			type: "input",
			keyValue: "type",
			message: "Which property type should be returned?",
		},
	],
	actions: [
		{
			type: "addFolder",
			dest: config.cliFolder,
		},
		{
			type: "copyTo",
			src: "templates/defaultInit/config.cli.json",
			typeFileFrom: "camelCase",
			nameFileTo: config.configFile,
			extFileTo: "{{ext}}",
			typeFileTo: "{{type}}",
		},
	],
});

export default defaultInit;
