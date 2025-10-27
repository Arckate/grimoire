import type { GeneratorsSubConfig } from "@arckate/grimoire-core/models";
import component from "./templates/default/component";
import controller from "./templates/default/controller";
import controllerff from "./templates/default/controllerff";

const generators: GeneratorsSubConfig = {
	subGenConf: true,
	default: {
		controllerff,
	},
	react: {
		controllerff,
		controller,
		component,
	},
	testReact: {
		controllerff,
		controller,
		component,
	},
};

export default generators;
