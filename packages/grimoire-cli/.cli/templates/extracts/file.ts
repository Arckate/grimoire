import type { GeneratorsFn } from "@arckate/grimoire-core/models";

const file: GeneratorsFn = () => ({
	description: "Extract file from source to destination",
	prompts: [
		{
			type: "input",
			keyValue: "srcName",
			message: "What's the source file name?",
		},
		{
			type: "input",
			keyValue: "destName",
			message: "What's the destination file name?",
		},
	],
	actions: [
		{
			type: "copy",
			src: "{{srcName}}",
			dest: "{{destName}}",
		},
	],
});

export default file;
