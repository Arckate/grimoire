import type { GeneratorsConfig } from "~/entities/Generators";
import type { StarterConfig } from "~/entities/Starters";
import type { FindConfig } from "~/path/findConfig";

export const extractAllGeneratorsConfig = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<StarterConfig>): FindConfig<GeneratorsConfig> => {
	return {
		defaultDirConfig: defaultDirConfig?.generators || null,
		dirConfig: dirConfig?.generators || null,
		rootConfig: rootConfig?.generators || null,
	};
};
