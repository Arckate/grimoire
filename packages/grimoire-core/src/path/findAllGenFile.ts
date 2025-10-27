import fs from "node:fs/promises";
import { findParentConfig } from "./findParentConfig";
import { isGenFile } from "./isGenFile";

export const findAllGenFile = async (path: string): Promise<string[]> => {
	const parentConfig = findParentConfig();
	const dir = await fs.readdir(path, { withFileTypes: true });
	const allFiles = dir.filter(
		(item) => !item.isDirectory() && isGenFile(item.name, parentConfig),
	);
	return allFiles.map(({ name }) => name);
};
