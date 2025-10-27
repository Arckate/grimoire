import fs from "node:fs";
import path from "node:path";
import { CONFIG_FILE, CONFIG_FILE_EXT } from "~/const";
import type { Config, ProcessTerm } from "~/models";

interface IsParentInCurrentFolderParams {
	processTerm: ProcessTerm;
	config: Config;
}

export const isConfigFileInFolder = ({
	processTerm,
	config,
}: IsParentInCurrentFolderParams): boolean => {
	const currentDir = processTerm.cwd();
	const filename = config?.configFile || CONFIG_FILE;
	const ext = config?.configFileExt || CONFIG_FILE_EXT;
	const filePath = path.join(currentDir, `${filename}.${ext}`);
	return fs.existsSync(filePath);
};
