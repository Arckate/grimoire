import path from "node:path";
import { ROOTS, DIRS, CLI_FOLDER } from "@arckate/grimoire-core/const";
import type { FindDir } from "@arckate/grimoire-core/entities";
import { getDirnames, getRoots, getGlobalConfig, getDirs } from "@arckate/grimoire-core/config";

export const constructorFindDir = (): ((name?: string) => FindDir) => {
	const defaultDir = getDirs(DIRS.DEFAULT_DIR) || "";
	let dir = getDirs(DIRS.DIR) || "";
	const dirnames = getDirnames();

	const root = getRoots(ROOTS.ROOT);
	if (root) {
		dir = path.join(root, `/${getGlobalConfig()?.cliFolder || CLI_FOLDER}`);
	}
	const allDirs = { defaultDir, dir, ...dirnames };

	return (name) => (extraPath) =>
		path.join(allDirs[name] || allDirs[DIRS.DIR], extraPath);
};
