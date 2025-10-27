import path from "node:path";
import {
	getDirnames,
	getDirs,
	getGlobalConfig,
	getRoots,
} from "@arckate/grimoire-core/config";
import { CLI_FOLDER, DIRS, ROOTS } from "@arckate/grimoire-core/const";
import type { FindDir } from "@arckate/grimoire-core/entities";

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
