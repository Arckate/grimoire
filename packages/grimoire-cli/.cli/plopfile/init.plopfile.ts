import { getInits } from "@arckate/grimoire-core/config";
import { DIRS } from "@arckate/grimoire-core/const";
import type { NodePlopAPI } from "node-plop";
import { constructorConfig } from "~/src/plop/constructorConfig";
import { constructorInitFindDir } from "~/src/plop/constructorInitFindDir";
import setup from "~/src/plop/setup";

export default async function (plop: NodePlopAPI) {
	setup(plop);

	const config = constructorConfig();

	const inits = getInits();
	const findDirFactory = constructorInitFindDir();

	for (const [name, initParams] of Object.entries(inits)) {
		let initFn = initParams;
		let nameDir = DIRS.DIR;
		if (
			typeof initFn === "object" &&
			initParams?.["initFn"] &&
			initParams?.["nameDir"]
		) {
			initFn = initParams["initFn"];
			nameDir = initParams["nameDir"];
		}

		if (name && typeof initFn === "function") {
			plop.setGenerator(
				name,
				initFn({ findDir: findDirFactory(nameDir), config }),
			);
		}
	}
}
