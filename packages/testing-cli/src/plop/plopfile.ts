import type { NodePlopAPI } from "node-plop";
import type { Config } from "../entities/Config";
import setup from "./setup";

const constructorNodePlop = (config: Config) => async (plop: NodePlopAPI) => {
	if (config.setup) {
		setup(plop, config.setup);
	}
	if (config.setup) {
		plop.setDefaultInclude({ findFile: config.findFile });
	}
	for (const [name, { generatorsFn, params }] of Object.entries(
		config.generators,
	)) {
		plop.setGenerator(name, generatorsFn(...params));
	}
};
export default constructorNodePlop;
