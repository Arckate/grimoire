import path from "node:path";
import { getDirnames, getDirs } from "@arckate/grimoire-core/config";
import { DIRS } from "@arckate/grimoire-core/const";
import type { InitFindDir } from "@arckate/grimoire-core/entities";

export const constructorInitFindDir = (): ((name?: string) => InitFindDir) => {
	const defaultDir = getDirs(DIRS.DEFAULT_DIR) || "";
	const dir = getDirs(DIRS.DIR) || "";
	const dirnames = getDirnames();

	const allDirs = { defaultDir, dir, ...dirnames };

	return (name) => (extraPath) =>
		path.join(allDirs[name] || allDirs[DIRS.DIR], extraPath);
};
