import type { StarterConfig, Starters } from "~/entities/Starters";
import type { FindConfig } from "~/path/findConfig";

export const extractAllStarter = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<StarterConfig>): FindConfig<Record<string, Starters>> => {
	return {
		defaultDirConfig: defaultDirConfig?.starters || null,
		dirConfig: dirConfig?.starters || null,
		rootConfig: rootConfig?.starters || null,
	};
};
