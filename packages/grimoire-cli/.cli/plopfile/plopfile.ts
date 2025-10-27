import { getGenerators } from "@arckate/grimoire-core/config";
import { DIRS } from "@arckate/grimoire-core/const";
import type { NodePlopAPI } from "node-plop";
import { constructorConfig } from "~/src/plop/constructorConfig";
import { constructorFindDir } from "~/src/plop/constructorFindDir";
import setup from "~/src/plop/setup";

export default async function (plop: NodePlopAPI) {
	setup(plop);

	const config = constructorConfig();

	const generators = getGenerators();
	const findDirFactory = constructorFindDir();
	for (const [name, generatorParams] of Object.entries(generators)) {
		let generatorsFn = generatorParams;
		let nameDir = DIRS.DIR;
		if (
			typeof generatorsFn === "object" &&
			generatorParams?.["generatorsFn"] &&
			generatorParams?.["nameDir"]
		) {
			generatorsFn = generatorParams["generatorsFn"];
			nameDir = generatorParams["nameDir"];
		}

		if (name && typeof generatorsFn === "function") {
			plop.setGenerator(
				name,
				generatorsFn({ findDir: findDirFactory(nameDir), config }),
			);
		}
	}
}
