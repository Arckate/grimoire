import nodePath from "node:path";
import { getGlobalConfig } from "~/config/global";
import { getRoots, setRoots } from "~/config/roots";
import { CONFIG_FILE } from "~/const/config";
import { REG_IS_ROOTS_PARENT, REG_IS_ROOTS_ROOT } from "~/const/regexp";
import { ROOTS } from "~/const/roots";
import { FilePathError } from "~/errors/FilePathError";
import { findRoots } from "./findRoots";

export const pathConstructor = async (
	strPath: any,
	oldPath: string = process.cwd(),
): Promise<string> => {
	if (strPath && typeof strPath === "string") {
		const isParentPath = REG_IS_ROOTS_PARENT.test(strPath);
		if (isParentPath) {
			const sanitizePath = strPath.slice(1);
			const parent = getRoots(ROOTS.PARENT);

			if (parent) {
				return nodePath.join(parent, sanitizePath);
			}
			const currentRoots = findRoots();

			if (currentRoots?.[ROOTS.PARENT]) {
				setRoots(currentRoots);
				return nodePath.join(currentRoots[ROOTS.PARENT], sanitizePath);
			}
			throw new FilePathError(
				`The ${ROOTS.PARENT} option requires at least one '${getGlobalConfig()?.configFile || CONFIG_FILE}' file to be present.`,
			);
		}
		const isRootPath = REG_IS_ROOTS_ROOT.test(strPath);
		if (isRootPath) {
			const sanitizePath = strPath.slice(2);
			const root = getRoots(ROOTS.ROOT);
			if (root) {
				return nodePath.join(root, sanitizePath);
			}
			const currentRoots = findRoots();
			if (currentRoots?.[ROOTS.ROOT]) {
				setRoots({ [ROOTS.ROOT]: currentRoots[ROOTS.ROOT] });
				return nodePath.join(currentRoots[ROOTS.ROOT], sanitizePath);
			}
			throw new FilePathError(
				`The ${ROOTS.ROOT} option requires at least one '${getGlobalConfig()?.configFile || CONFIG_FILE}' file in which root parameter set to 'true'`,
			);
		}
		if (nodePath.isAbsolute(strPath)) {
			return strPath;
		}
		return nodePath.join(oldPath, strPath);
	}

	return oldPath;
};
