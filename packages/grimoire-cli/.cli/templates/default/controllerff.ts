const controllerff = () => ({
	description: "plop generating controllerff..",
	prompts: [
		{
			type: "input",
			name: "type",
			message: "",
		},
		{
			when: (context) => {
				console.log(context);
				return true;
			},
			type: "input",
			name: "name",
			message: "controller name please",
		},
	],
	actions: [
		{
			type: "add",
			path: "test/controller/json/{{lowerCase name}}.js",
			templateFile: "templates/controller.hbs.tsx",
		},
	],
});

export default controllerff;
