import fs from "node:fs";
import path from "node:path";
import type { FindFile } from "@arckate/grimoire-core/entities";
import type { CustomActionFunction } from "node-plop";
import { normalizePath } from "./utils/normalizePath";

export const copyTo: CustomActionFunction = (answers, config, plop) => {
	const src = path.resolve(
		plop.getPlopfilePath(),
		plop.renderString(config.src, answers),
	);
	const extFrom = path.extname(src).slice(1);
	const typeFrom = plop.renderString(config.typeFileFrom, answers);

	const extTo = plop.renderString(config.extFileTo, answers);
	const typeTo = plop.renderString(config.typeFileTo, answers);

	const dest = path.resolve(
		plop.getDestBasePath(),
		plop.renderString(`${config.nameFileTo}.${config.extFileTo}`, answers),
	);

	if (!config.force && fs.existsSync(dest)) {
		throw { type: config.type, path: dest, error: "File already exists" };
	}

	const { findFile } = plop.getDefaultInclude() as { findFile?: FindFile };

	if (
		findFile?.[extFrom]?.[typeFrom]?.read &&
		findFile?.[extTo]?.[typeTo]?.write
	) {
		const read = findFile[extFrom][typeFrom].read;
		const write = findFile[extTo][typeTo].write;
		const dirname = path.dirname(dest);
		fs.mkdirSync(dirname, { recursive: true });
		const value = read(normalizePath(src));
		write(normalizePath(dest), value);
		return normalizePath(dest);
	}

	throw {
		type: config.type,
		path: dest,
		error: "findFile or one value in findFile doesn't exists",
	};
};
