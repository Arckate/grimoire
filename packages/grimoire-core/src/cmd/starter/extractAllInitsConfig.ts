import type { InitsConfig } from "~/entities/Inits";
import type { StarterConfig } from "~/entities/Starters";
import type { FindConfig } from "~/path/findConfig";

export const extractAllInitsConfig = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<StarterConfig>): FindConfig<InitsConfig> => {
	return {
		defaultDirConfig: defaultDirConfig?.inits || null,
		dirConfig: dirConfig?.inits || null,
		rootConfig: rootConfig?.inits || null,
	};
};
