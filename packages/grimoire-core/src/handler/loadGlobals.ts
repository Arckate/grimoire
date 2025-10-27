import fs from "node:fs";
import path from "node:path";
import type { Cli } from "~/Cli";
import { resolveCliPath } from "~/path";
import { loadConfig } from "~/utils";

interface LoadGlobalsParams {
	globalsFile?: string;
	inlineGlobals?: string[];
}

const parseInlineGlobals = (values: string[]): Record<string, string> =>
	values.reduce(
		(acc, kv) => {
			const idx = kv.indexOf("=");
			if (idx !== -1) {
				acc[kv.slice(0, idx)] = kv.slice(idx + 1);
			}
			return acc;
		},
		{} as Record<string, string>,
	);

const loadGlobalsFile = async (
	filePath: string,
): Promise<Record<string, any>> => {
	if (path.extname(filePath) === ".json") {
		return JSON.parse(fs.readFileSync(filePath, "utf-8"));
	}
	const mod = await loadConfig(filePath);
	return mod.default ?? mod;
};

export const loadGlobals = async (
	cli: Cli,
	{ globalsFile, inlineGlobals = [] }: LoadGlobalsParams,
): Promise<void> => {
	if (globalsFile) {
		const resolved = resolveCliPath(cli, globalsFile);
		const fileGlobals = await loadGlobalsFile(resolved);
		cli.addGlobals(fileGlobals);
	}
	if (inlineGlobals.length) {
		cli.addGlobals(parseInlineGlobals(inlineGlobals));
	}
};
