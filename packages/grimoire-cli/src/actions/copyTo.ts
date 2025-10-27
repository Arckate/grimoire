import fs from "node:fs";
import path from "node:path";
import type { Processor } from "@arckate/grimoire-core/models";
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

	const { processor } = plop.getDefaultInclude() as { processor?: Processor };

	if (
		processor?.[extFrom]?.[typeFrom]?.read &&
		processor?.[extTo]?.[typeTo]?.write
	) {
		const read = processor[extFrom][typeFrom].read;
		const write = processor[extTo][typeTo].write;
		const dirname = path.dirname(dest);
		fs.mkdirSync(dirname, { recursive: true });
		const value = read(normalizePath(src));
		write(normalizePath(dest), value);
		return normalizePath(dest);
	}

	throw {
		type: config.type,
		path: dest,
		error: "processor or one value in processor doesn't exists",
	};
};
