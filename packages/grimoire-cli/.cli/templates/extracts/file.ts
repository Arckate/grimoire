import type { ExtractFn } from "@arckate/grimoire-core/entities";

const file: ExtractFn = ({ findDir }) => ({
	description: "Extract file from source to destination",
	prompts: [
		{
			type: "input",
			name: "srcName",
			message: "What's the source file name?",
		},
		{
			type: "input",
			name: "destName",
			message: "What's the destination file name?",
		},
	],
	actions: [
		{
			type: "copy",
			src: findDir("{{srcName}}"),
			dest: "{{destName}}",
		},
	],
});

export default file;
