import { readFileSync } from "node:fs";
import { extname } from "node:path";
import type { Cli } from "~/Cli";
import type { PlanPatches } from "~/models";
import { resolveCliPath } from "~/path";
import { loadConfig } from "../utils/loadConfig";

export const loadPatches = async (
	cli: Cli,
	patchPath: string,
): Promise<PlanPatches> => {
	const absPath = resolveCliPath(cli, patchPath);

	if (extname(absPath) === ".json") {
		return JSON.parse(readFileSync(absPath, "utf-8")) as PlanPatches;
	}

	const mod = await loadConfig(absPath);
	return (mod.default ?? mod) as PlanPatches;
};
