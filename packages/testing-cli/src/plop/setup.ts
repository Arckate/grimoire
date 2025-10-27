import type { NodePlopAPI } from "node-plop";
import type { ConfigSetup } from "../entities/Config";

const setup = (plop: NodePlopAPI, config: ConfigSetup) => {
	const helpers = config?.helpers;
	if (helpers) {
		for (const [name, helper] of Object.entries(helpers)) {
			plop.setHelper(name, helper);
		}
	}
	const partials = config?.partials;
	if (partials) {
		for (const [name, partial] of Object.entries(partials)) {
			plop.setPartial(name, partial);
		}
	}
	const actions = config?.actions;
	if (actions) {
		for (const [name, action] of Object.entries(actions)) {
			plop.setActionType(name, action);
		}
	}

	const prompts = config?.prompts;
	if (prompts) {
		for (const [name, prompt] of Object.entries(prompts)) {
			plop.setPrompt(name, prompt);
		}
	}
};

export default setup;
