import path from "node:path";
import {
	getDirnames,
	getDirs,
	getGlobalConfig,
	getRoots,
} from "@arckate/grimoire-core/config";
import {
	CLI_FOLDER,
	DIRS,
	REG_IS_DIRS,
	ROOTS,
} from "@arckate/grimoire-core/const";
import type { ExtractFindDir } from "@arckate/grimoire-core/entities";

export const constructorExtractFindDir = (): ((
	name?: string,
) => ExtractFindDir) => {
	let allDirs: Record<string, string> = {
		dir: getDirs(DIRS.DIR),
		defaultDir: getDirs(DIRS.DEFAULT_DIR),
	};
	const [first, ...inPath] = getDirs(DIRS.IN_PATH)?.split("/") || [];
	let innerName: string = "";
	let otherPath = "";
	if (first) {
		if (REG_IS_DIRS.test(first)) {
			innerName = first.match(REG_IS_DIRS)?.[1] || DIRS.DIR;
			otherPath = inPath.length ? inPath.join("/") : "";
		}
		otherPath = inPath.length ? inPath.join("/") : "";
	}

	const root = getRoots(ROOTS.ROOT);
	if (root) {
		const dirnames = getDirnames();
		const rootDir = path.join(
			root,
			`/${getGlobalConfig()?.cliFolder || CLI_FOLDER}`,
		);
		allDirs = { ...allDirs, rootDir, ...dirnames };
	}

	return (name) => (extraPath) =>
		path.join(
			allDirs[innerName || name] || allDirs[DIRS.DIR],
			otherPath || "",
			extraPath,
		);
};
