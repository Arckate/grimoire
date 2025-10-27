import { getGlobalConfig } from "@arckate/grimoire-core/config";
import type { NodePlopAPI } from "node-plop";

const setup = (plop: NodePlopAPI) => {
	const helpers = getGlobalConfig()?.helpers;
	if (helpers) {
		for (const [name, helper] of Object.entries(helpers)) {
			plop.setHelper(name, helper);
		}
	}
	const partials = getGlobalConfig()?.partials;
	if (partials) {
		for (const [name, partial] of Object.entries(partials)) {
			plop.setPartial(name, partial);
		}
	}
	const actions = getGlobalConfig()?.actions;
	if (actions) {
		for (const [name, action] of Object.entries(actions)) {
			plop.setActionType(name, action);
		}
	}

	const prompts = getGlobalConfig()?.prompts;
	if (prompts) {
		for (const [name, prompt] of Object.entries(prompts)) {
			plop.setPrompt(name, prompt);
		}
	}
};

export default setup;
