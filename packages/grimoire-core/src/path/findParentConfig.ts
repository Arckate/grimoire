import fs from "node:fs";
import path from "node:path";
import type { Cli } from "~/Cli";
import {
	CONFIG_FILE,
	CONFIG_FILE_EXT,
	PLAN_EXT,
	PLAN_TYPE,
	ROOTS,
} from "~/const";
import type { RecordCamelCase } from "~/models";
import { readConfigCliFile } from "~/utils";
import { findRoots } from "./findRoots";

export const findParentConfig = (
	cli: Cli,
): RecordCamelCase<string, string> | null => {
	const processTerm = cli.getProcessTerm();
	const config = cli.getConfig();
	let parent = cli.getDir(ROOTS.PARENT);
	if (!parent) {
		const currentRoots = findRoots({ processTerm, config });
		if (currentRoots?.[ROOTS.PARENT]) {
			cli.addDirs({ [ROOTS.PARENT]: currentRoots?.[ROOTS.PARENT] });
		}
		parent = currentRoots[ROOTS.PARENT];
	}
	const filename = config.configFile || CONFIG_FILE;
	const ext = config.configFileExt || CONFIG_FILE_EXT;
	const parentConfigPath = path.join(parent || "./", `${filename}.${ext}`);

	if (fs.existsSync(parentConfigPath)) {
		const parentConfig = readConfigCliFile(config, parentConfigPath);
		cli.addGlobals({
			currentPlanExt: parentConfig.planExt || config.planExt || PLAN_EXT,
			currentPlanType: parentConfig.planType || config.planType || PLAN_TYPE,
		});
		return parentConfig;
	}

	return null;
};
