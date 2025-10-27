import fs from "node:fs";
import path from "node:path";
import { CONFIG_FILE, CONFIG_FILE_EXT, ROOT_KEY, ROOTS } from "~/const";
import type { Config, ProcessTerm, Roots } from "~/models";
import { get, readConfigCliFile } from "~/utils";

interface findRootsParams {
	processTerm: ProcessTerm;
	config: Config;
	findRoot?: boolean;
}

export const findRoots = ({
	processTerm,
	config,
	findRoot = false,
}: findRootsParams): Roots => {
	let currentDir = processTerm.cwd();
	const filename = config?.configFile || CONFIG_FILE;
	const ext = config?.configFileExt || CONFIG_FILE_EXT;
	const roots: Roots = {
		[ROOTS.PARENT]: null,
		[ROOTS.ROOT]: null,
	};
	while (true) {
		const filePath = path.join(currentDir, `${filename}.${ext}`);

		if (fs.existsSync(filePath)) {
			const configCli = readConfigCliFile(config, filePath);
			const rootKey = config?.rootKey || ROOT_KEY;
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
