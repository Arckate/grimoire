import nodePath from "node:path";
import type { Cli } from "~/Cli";
import { PLAN_EXT } from "~/const";
import type { RecordCamelCase } from "~/models";

export const isPlanFile = (
	cli: Cli,
	path: string,
	parentConfig: RecordCamelCase<string, string> | null,
): boolean => {
	const planExt = parentConfig?.planExt || cli.getConfig().planExt || PLAN_EXT;
	const { base } = nodePath.parse(path);
	const regExp = new RegExp(`[.]plan[.]${planExt}`);
	return regExp.test(base);
};
