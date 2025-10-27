import fs from "node:fs";
import path from "node:path";
import type { CustomActionFunction } from "node-plop";
import { normalizePath } from "./utils/normalizePath";

export const copy: CustomActionFunction = (answers, config, plop) => {
	const src = path.resolve(
		plop.getPlopfilePath(),
		plop.renderString(config.src, answers),
	);

	const dest = path.resolve(
		plop.getDestBasePath(),
		plop.renderString(config.dest, answers),
	);

	if (!config.force && fs.existsSync(dest)) {
		throw { type: config.type, path: dest, error: "File already exists" };
	}

	const dirname = path.dirname(dest);
	fs.mkdirSync(dirname, { recursive: true });
	fs.copyFileSync(normalizePath(src), normalizePath(dest));
	return normalizePath(dest);
};
