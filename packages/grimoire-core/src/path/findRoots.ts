import fs from "node:fs";
import path from "node:path";
import { getGlobalConfig } from "~/config/global";
import { CONFIG_FILE, CONFIG_FILE_EXT, ROOT_KEY } from "~/const/config";
import { ROOTS } from "~/const/roots";
import type { Roots } from "~/entities/Roots";
import { readConfigCliFile } from "~/utils/readConfigCliFile";
import { get } from "../utils/get";

export const findRoots = (findRoot = false): Roots => {
	let currentDir = process.cwd();
	const filename = getGlobalConfig()?.configFile || CONFIG_FILE;
	const ext = getGlobalConfig()?.configFileExt || CONFIG_FILE_EXT;
	const roots: Roots = {
		[ROOTS.PARENT]: null,
		[ROOTS.ROOT]: null,
	};
	while (true) {
		const filePath = path.join(currentDir, `${filename}.${ext}`);

		if (fs.existsSync(filePath)) {
			const configCli = readConfigCliFile(filePath);
			const rootKey = getGlobalConfig()?.rootKey || ROOT_KEY;
			const root = get(configCli || {}, rootKey, {});
			if (root) {
				roots[ROOTS.ROOT] = path.dirname(filePath);
			}
			if (findRoot && roots[ROOTS.ROOT]) {
				return roots;
			}
			roots[ROOTS.PARENT] = path.dirname(filePath);
			return roots;
		}

		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) {
			break;
		}
		currentDir = parentDir;
	}

	return roots;
};
