import type { GeneratorsFn } from "@arckate/grimoire-core/models";

const folder: GeneratorsFn = () => ({
	description: "Extract folder from source to destination",
	prompts: [
		{
			type: "input",
			keyValue: "srcName",
			message: "What's the source folder name?",
		},
		{
			type: "input",
			keyValue: "destName",
			message: "What's the destination folder name?",
		},
	],
	actions: [
		{
			type: "copyFolder",
			src: "{{srcName}}",
			dest: "{{destName}}",
		},
	],
});

export default folder;
