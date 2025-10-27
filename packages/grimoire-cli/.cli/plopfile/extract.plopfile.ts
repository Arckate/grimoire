import { getExtracts } from "@arckate/grimoire-core/config";
import { DIRS } from "@arckate/grimoire-core/const";
import type { NodePlopAPI } from "node-plop";
import { constructorConfig } from "~/src/plop/constructorConfig";
import { constructorExtractFindDir } from "~/src/plop/constructorExtractFindDir";
import setup from "~/src/plop/setup";

export default async function (plop: NodePlopAPI) {
	setup(plop);

	const config = constructorConfig();

	const extracts = getExtracts();
	const findDirFactory = constructorExtractFindDir();

	for (const [name, extractParams] of Object.entries(extracts)) {
		let extractsFn = extractParams;
		let nameDir = DIRS.DIR;
		if (
			typeof extractsFn === "object" &&
			extractParams?.["extractsFn"] &&
			extractParams?.["nameDir"]
		) {
			extractsFn = extractParams["extractsFn"];
			nameDir = extractParams["nameDir"];
		}

		if (name && typeof extractsFn === "function") {
			plop.setGenerator(
				name,
				extractsFn({ findDir: findDirFactory(nameDir), config }),
			);
		}
	}
}
