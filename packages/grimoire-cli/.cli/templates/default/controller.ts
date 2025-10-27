const controller = () => ({
	description: "plop generating controller..",
	prompts: async (inquirer) => {
		const basicAnswers = await inquirer.prompt([]);
		console.log(basicAnswers);
		return { name: "test" };
	},
	actions: [
		{
			type: "add",
			path: "test/controller/json/{{lowerCase name}}.js",
			templateFile: "templates/controller.hbs.tsx",
		},
	],
});

export default controller;
