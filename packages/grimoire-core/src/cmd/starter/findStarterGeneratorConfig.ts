import type { Generators, GeneratorsConfig } from "~/entities/Generators";
import type { FindConfig } from "~/path/findConfig";
import { mergeGeneratorConfig } from "../generators";

export const findStarterGeneratorConfig = (
	AllConfig: FindConfig<GeneratorsConfig>,
): GeneratorsConfig => {
	const config = mergeGeneratorConfig(AllConfig);
	if (config.subGenConf) {
		return config;
	}
	return {
		subGenConf: true,
		default: config as Generators,
	};
};
