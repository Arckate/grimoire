import fs from "node:fs";
import path from "node:path";
import type { CustomActionFunction } from "node-plop";
import { normalizePath } from "./utils/normalizePath";

export const copyFolder: CustomActionFunction = (answers, config, plop) => {
	const srcDir = path.resolve(
		plop.getPlopfilePath(),
		plop.renderString(config.src, answers),
	);

	const destDir = path.resolve(
		plop.getDestBasePath(),
		plop.renderString(config.dest, answers),
	);

	if (!config.force && fs.existsSync(destDir)) {
		throw { type: config.type, path: destDir, error: "Folder already exists" };
	}

	fs.mkdirSync(destDir, { recursive: true });

	fs.cpSync(normalizePath(srcDir), normalizePath(destDir), {
		recursive: true,
	});

	return normalizePath(destDir);
};
