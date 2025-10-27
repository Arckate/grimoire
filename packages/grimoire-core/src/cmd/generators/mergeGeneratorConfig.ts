import merge from "lodash.merge";
import type { Generators, GeneratorsConfig } from "~/entities/Generators";
import type { FindConfig } from "~/path/findConfig";

export const mergeGeneratorConfig = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<GeneratorsConfig>): GeneratorsConfig => {
	const oneIsMulti =
		dirConfig?.subGenConf ||
		defaultDirConfig?.subGenConf ||
		rootConfig?.subGenConf;
	let currentDefaultDirConfig = defaultDirConfig || {};
	let currentDirConfig = dirConfig || {};
	let currentRootConfig = rootConfig || {};

	if (
		oneIsMulti &&
		!currentDirConfig.subGenConf &&
		Object.values(currentDirConfig).length
	) {
		currentDirConfig = {
			subGenConf: true,
			default: currentDirConfig as Generators,
		};
	}
	if (
		oneIsMulti &&
		!currentDefaultDirConfig.subGenConf &&
		Object.values(currentDefaultDirConfig).length
	) {
		currentDefaultDirConfig = {
			subGenConf: true,
			default: currentDefaultDirConfig as Generators,
		};
	}
	if (
		oneIsMulti &&
		!currentRootConfig.subGenConf &&
		Object.values(currentRootConfig).length
	) {
		currentRootConfig = {
			subGenConf: true,
			default: currentRootConfig as Generators,
		};
	}

	return merge(currentDefaultDirConfig, currentDirConfig, currentRootConfig);
};
