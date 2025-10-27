import merge from "lodash.merge";
import type { FindConfig } from "~/path/findConfig";

export const mergeDirnames = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<Record<string, string>>): Record<string, string> => {
	const currentDefaultDirConfig = defaultDirConfig || {};
	const currentDirConfig = dirConfig || {};
	const currentRootConfig = rootConfig || {};
	return merge(currentDefaultDirConfig, currentDirConfig, currentRootConfig);
};
