import fs from "node:fs";
import path from "node:path";
import { getRoots, setRoots } from "~/config/roots";
import { ROOTS } from "~/const/roots";
import { FilePathError } from "~/errors/FilePathError";
import { loadConfig } from "~/utils/loadConfig";
import { findRoots } from "./findRoots";

export interface FindConfig<T> {
	dirConfig: T | null;
	defaultDirConfig: T | null;
	rootConfig: T | null;
}

interface FindConfigParams {
	dir: string;
	defaultDir: string;
	nameConfigFile: string;
}

export const findConfig = async <T extends Record<string, unknown>>({
	dir,
	defaultDir,
	nameConfigFile,
}: FindConfigParams): Promise<FindConfig<T>> => {
	let nameFile = nameConfigFile;

	if ([".ts", ".js"].includes(path.parse(nameConfigFile).ext)) {
		nameFile = path.parse(nameConfigFile).name;
	}

	let dirConfig = null;
	let defaultDirConfig = null;
	let rootConfig = null;
	if (
		fs.existsSync(path.join(dir, `${nameFile}.ts`)) ||
		fs.existsSync(path.join(dir, `${nameFile}.js`))
	) {
		const { default: conf } = await loadConfig(path.join(dir, nameFile));
		dirConfig = conf;
	}

	if (
		fs.existsSync(path.join(defaultDir, `${nameFile}.ts`)) ||
		fs.existsSync(path.join(defaultDir, `${nameFile}.js`))
	) {
		const { default: conf } = await loadConfig(path.join(defaultDir, nameFile));
		defaultDirConfig = conf;
	}

	let root = getRoots(ROOTS.ROOT);
	if (!root) {
		const { [ROOTS.ROOT]: currentRoot } = findRoots(true);
		if (currentRoot) {
			setRoots({ [ROOTS.ROOT]: currentRoot });
		}
		root = currentRoot;
	}

	if (
		root &&
		(fs.existsSync(path.join(root, `${nameFile}.ts`)) ||
			fs.existsSync(path.join(root, `${nameFile}.js`)))
	) {
		const { default: conf } = await loadConfig(path.join(root, nameFile));
		rootConfig = conf;
	}

	if (dirConfig || defaultDirConfig || rootConfig) {
		return {
			dirConfig,
			defaultDirConfig,
			rootConfig,
		};
	}

	throw new FilePathError(`The file "${nameConfigFile}" does not exist.`);
};
