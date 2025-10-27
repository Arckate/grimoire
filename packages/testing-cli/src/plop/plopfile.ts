import type { NodePlopAPI } from "node-plop";
import type { Config } from "../models";
import setup from "./setup";

const constructorNodePlop = (config: Config) => async (plop: NodePlopAPI) => {
	if (config.setup) {
		setup(plop, config.setup);
	}
	if (config.setup) {
		plop.setDefaultInclude({ processor: config.processor });
	}
	for (const [name, { generatorsFn, params }] of Object.entries(
		config.generators,
	)) {
		plop.setGenerator(name, generatorsFn(...params));
	}
};
export default constructorNodePlop;
