import merge from "lodash.merge";
import type { Inits, InitsConfig } from "~/entities/Inits";
import type { FindConfig } from "~/path/findConfig";

export const mergeInitsConfig = ({
	defaultDirConfig,
	dirConfig,
	rootConfig,
}: FindConfig<InitsConfig>): Inits => {
	const currentDefaultDirGenConfig = defaultDirConfig || {};
	const currentDirConfig = dirConfig || {};
	const currentRootGenConfig = rootConfig || {};

	return merge(
		currentDefaultDirGenConfig,
		currentDirConfig,
		currentRootGenConfig,
	);
};
