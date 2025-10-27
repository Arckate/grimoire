import path from "node:path";
import type { Cli } from "~/Cli";
import { ROOTS } from "~/const";
import { findRoots } from "./findRoots";

const ensureDir = (cli: Cli, key: string): string | null => {
	const existing = cli.getDir(key);
	if (existing) return existing;

	const roots = findRoots({
		processTerm: cli.getProcessTerm(),
		config: cli.getConfig(),
	});

	const value = roots[key] ?? null;
	if (value) {
		cli.addDirs({ [key]: value });
	}
	return value;
};

export const resolveCliPath = (cli: Cli, inputPath: string): string => {
	const processTerm = cli.getProcessTerm();

	if (inputPath.startsWith(`${ROOTS.ROOT}/`) || inputPath === ROOTS.ROOT) {
		const root = ensureDir(cli, ROOTS.ROOT);
		const rest = inputPath.slice(ROOTS.ROOT.length);
		return path.join(root ?? processTerm.cwd(), rest);
	}

	if (inputPath.startsWith(`${ROOTS.PARENT}/`) || inputPath === ROOTS.PARENT) {
		const parent = ensureDir(cli, ROOTS.PARENT);
		const rest = inputPath.slice(ROOTS.PARENT.length);
		return path.join(parent ?? processTerm.cwd(), rest);
	}

	if (inputPath.startsWith("/")) {
		return path.join(processTerm.cwd(), inputPath);
	}

	return inputPath;
};
