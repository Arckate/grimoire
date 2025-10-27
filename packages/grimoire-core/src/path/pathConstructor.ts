import nodePath from "node:path";
import type { Cli } from "~/Cli";
import {
	CONFIG_FILE,
	REG_IS_ROOTS_PARENT,
	REG_IS_ROOTS_ROOT,
	ROOTS,
} from "~/const";
import { FilePathError } from "~/errors";
import { findRoots } from "./findRoots";

export const pathConstructor = async (
	cli: Cli,
	strPath: any,
	newOldPath?: string,
): Promise<string> => {
	const processTerm = cli.getProcessTerm();
	const config = cli.getConfig();
	const oldPath = newOldPath || processTerm.cwd();
	if (strPath && typeof strPath === "string") {
		const isParentPath = REG_IS_ROOTS_PARENT.test(strPath);
		if (isParentPath) {
			const sanitizePath = strPath.slice(1);
			const parent = cli.getDir(ROOTS.PARENT);

			if (parent) {
				return nodePath.join(parent, sanitizePath);
			}
			const currentRoots = findRoots({ processTerm, config });

			if (currentRoots?.[ROOTS.PARENT]) {
				cli.addDirs({
					[ROOTS.PARENT]: currentRoots[ROOTS.PARENT],
					...(currentRoots[ROOTS.ROOT]
						? { [ROOTS.ROOT]: currentRoots[ROOTS.ROOT] }
						: {}),
				});
				return nodePath.join(currentRoots[ROOTS.PARENT], sanitizePath);
			}
			throw new FilePathError(
				`The ${ROOTS.PARENT} option requires at least one '${config.configFile || CONFIG_FILE}' file to be present.`,
			);
		}
		const isRootPath = REG_IS_ROOTS_ROOT.test(strPath);
		if (isRootPath) {
			const sanitizePath = strPath.slice(2);
			const root = cli.getDir(ROOTS.ROOT);
			if (root) {
				return nodePath.join(root, sanitizePath);
			}
			const currentRoots = findRoots({ processTerm, config });
			if (currentRoots?.[ROOTS.ROOT]) {
				cli.addDirs({ [ROOTS.ROOT]: currentRoots[ROOTS.ROOT] });
				return nodePath.join(currentRoots[ROOTS.ROOT], sanitizePath);
			}
			throw new FilePathError(
				`The ${ROOTS.ROOT} option requires at least one '${config.configFile || CONFIG_FILE}' file in which root parameter set to 'true'`,
			);
		}
		if (nodePath.isAbsolute(strPath)) {
			return strPath;
		}
		return nodePath.join(oldPath, strPath);
	}

	return oldPath;
};
