import fs from "node:fs/promises";
import type { Cli } from "~/Cli";
import { findParentConfig } from "./findParentConfig";
import { isPlanFile } from "./isPlanFile";

export const findAllPlanFile = async (
	cli: Cli,
	path: string,
): Promise<string[]> => {
	const parentConfig = findParentConfig(cli);
	const dir = await fs.readdir(path, { withFileTypes: true });
	const allFiles = dir.filter(
		(item) => !item.isDirectory() && isPlanFile(cli, item.name, parentConfig),
	);
	return allFiles.map(({ name }) => name);
};
