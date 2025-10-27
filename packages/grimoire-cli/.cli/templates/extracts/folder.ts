import type { ExtractFn } from "@arckate/grimoire-core/entities";

const folder: ExtractFn = ({ findDir }) => ({
	description: "Extract folder from source to destination",
	prompts: [
		{
			type: "input",
			name: "srcName",
			message: "What's the source folder name?",
		},
		{
			type: "input",
			name: "destName",
			message: "What's the destination folder name?",
		},
	],
	actions: [
		{
			type: "copyFolder",
			src: findDir("{{srcName}}"),
			dest: "{{destName}}",
		},
	],
});

export default folder;
