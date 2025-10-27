import type { Starters } from "@arckate/grimoire-core/entities";

const reactDefault: Starters = {
	step1: { inputQuestion: "test?", key: "test" },
	step2: {
		typeGen: "react",
		generator: "component",
		params: {},
		out: "string",
	},
	step3: {
		question: "choice one start framework",
		key: "framework",
		values: {
			tanStack: { typeGen: "react", generator: "component", params: {} },
			reactRouter: { typeGen: "react", generator: "component", params: {} },
			default: { typeGen: "react", in: "files" },
		},
	},
	step4: {
		question: "choice one start framework",
		key: "framework",
		values: {
			tanStack: { typeGen: "react", generator: "component", params: {} },
			reactRouter: { typeGen: "react", generator: "component", params: {} },
			default: { typeGen: "react", in: "files" },
		},
	},
};
export default reactDefault;
