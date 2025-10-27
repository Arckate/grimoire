const component = () => ({
	description: "plop generating component..",
	prompts: [
		{
			type: "input",
			name: "test",
			message: "controller test please",
		},
		{
			type: "input",
			name: "name",
			message: "controller name please",
		},
	],
	actions: [
		{
			type: "add",
			path: "test/component/{{lowerCase name}}.js",
			templateFile: "templates/controller.hbs.tsx",
		},
		{
			type: "add",
			path: "test/component/{{camelCase test}}.js",
			templateFile: "templates/controller.hbs.tsx",
		},
	],
});

export default component;
