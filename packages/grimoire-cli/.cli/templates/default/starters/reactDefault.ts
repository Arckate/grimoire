const reactDefault = {
	step1: {
		ctorKey: "input",
		inputQuestion: "test?",
		key: "test",
	},
	step2: {
		ctorKey: "gen",
		typeGen: "react",
		generator: "component",
		params: {},
	},
	step3: {
		ctorKey: "multiChoice",
		question: "choice one start framework",
		key: "framework",
		values: {
			tanStack: {
				ctorKey: "gen",
				typeGen: "react",
				generator: "component",
				params: {},
			},
			reactRouter: {
				ctorKey: "gen",
				typeGen: "react",
				generator: "component",
				params: {},
			},
			default: {
				ctorKey: "genExtract",
				in: "files",
			},
		},
	},
} as const;

export default reactDefault;
