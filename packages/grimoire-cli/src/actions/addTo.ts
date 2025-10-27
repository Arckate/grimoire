import fs from "node:fs";
import pathNode from "node:path";
import type { FindFile } from "@arckate/grimoire-core/entities";
import type { CustomActionFunction } from "node-plop";
import { normalizePath } from "./utils/normalizePath";

export const addTo: CustomActionFunction = (answers, config, plop) => {
	const templateFilePath = pathNode.resolve(
		plop.getPlopfilePath(),
		plop.renderString(config.templateFile, answers),
	);

	const path = pathNode.resolve(
		plop.getDestBasePath(),
		plop.renderString(config.path, answers),
	);
	const extFrom = pathNode.extname(normalizePath(templateFilePath)).slice(1);
	const typeFrom = plop.renderString(config.typeFileFrom, answers);

	const extTo = pathNode.extname(config.path).slice(1);
	const typeTo = plop.renderString(config.typeFileTo, answers);

	if (!config.force && fs.existsSync(path)) {
		throw { type: config.type, path, error: "File already exists" };
	}

	const template = fs.readFileSync(normalizePath(templateFilePath), "utf-8");

	const templateFile = plop.renderString(template || "", answers);
	const { findFile } = plop.getDefaultInclude() as { findFile?: FindFile };

	if (
		findFile?.[extFrom]?.[typeFrom]?.stringTo &&
		findFile?.[extTo]?.[typeTo]?.write
	) {
		const stringTo = findFile[extFrom][typeFrom].stringTo;
		const write = findFile[extTo][typeTo].write;
		const value = stringTo(templateFile);
		write(normalizePath(path), value);
		return normalizePath(path);
	}

	throw {
		type: config.type,
		path,
		error: "findFile or one value in findFile doesn't exists",
	};
};
