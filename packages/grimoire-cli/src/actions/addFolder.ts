import fs from "node:fs";
import path from "node:path";
import type { CustomActionFunction } from "node-plop";
import { normalizePath } from "./utils/normalizePath";

export const addFolder: CustomActionFunction = (answers, config, plop) => {
	const dest = path.join(
		plop.getDestBasePath(),
		plop.renderString(config.dest, answers),
	);

	if (!config.force && fs.existsSync(dest)) {
		throw { type: config.type, path: dest, error: "Folder already exists" };
	}

	fs.mkdirSync(normalizePath(dest), { recursive: true });
	return dest;
};
