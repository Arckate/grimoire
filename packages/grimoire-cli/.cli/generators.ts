import type { GeneratorsConfig } from "@arckate/grimoire-core/entities";
import component from "./templates/default/component";
import controller from "./templates/default/controller";
import controllerff from "./templates/default/controllerff";

const config: GeneratorsConfig = {
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

export default config;
