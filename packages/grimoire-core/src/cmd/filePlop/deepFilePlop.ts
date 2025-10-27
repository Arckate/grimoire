import { setGenerators } from "~/config/generators";
import { getGlobalConfig, setGlobalConfig } from "~/config/global";
import { getRoots, setRoots } from "~/config/roots";
import { GEN_FILE_EXT, GEN_FILE_TYPE } from "~/const/config";
import { ROOTS } from "~/const/roots";
import type { RecordCamelCase } from "~/entities/CmdConfig";
import type { GeneratorsConfig } from "~/entities/Generators";
import type { GenObject } from "~/entities/GenObject";
import type { ProcessTerm } from "~/entities/ProcessTerm";
import { findParentConfig } from "~/path/findParentConfig";
import { findRoots } from "~/path/findRoots";
import { findGenerators } from "../generators";
import { filePlop } from "./filePlop";

interface DeepFilePlopParams {
	argsList: (string | GenObject)[];
	configPath: string;
	generatorsConfig: GeneratorsConfig;
	force?: boolean;
	deep?: boolean;
	dest?: string;
	ignoreDest?: boolean;
	typeGen?: string;
	processTerm: ProcessTerm;
	genFileName?: string;
	parentConfig: RecordCamelCase<string, string>;
}
export const deepFilePlop = async ({
	argsList,
	configPath,
	force = false,
	dest = process.cwd(),
	ignoreDest = false,
	typeGen,
	deep = false,
	generatorsConfig,
	processTerm,
	genFileName,
	parentConfig,
}: DeepFilePlopParams): Promise<boolean> => {
	const generators = await findGenerators({
		config: generatorsConfig,
		typeGen,
		processTerm,
	});
	setGenerators(generators);
	for (const args of argsList) {
		let innerParentConfig = parentConfig;
		const parent = getRoots(ROOTS.PARENT);
		const globalConfig = getGlobalConfig();
		if (parent && !dest.startsWith(parent) && !generators.subGenConf) {
			const currentRoots = findRoots();
			setRoots(currentRoots);
			const generators = await findGenerators({
				config: generatorsConfig,
				typeGen,
				processTerm,
			});
			setGenerators(generators);
			innerParentConfig = findParentConfig();
		}
		const {
			argsList: childArgsList,
			dest: childDest,
			genFileName: childGenFileName,
		} = await filePlop({
			args,
			configPath,
			force,
			oldDest: dest,
			ignoreDest,
			deep,
			processTerm,
			oldGenFileName: genFileName,
			parentConfig: innerParentConfig,
		});
		await deepFilePlop({
			argsList: childArgsList,
			dest: childDest,
			genFileName: childGenFileName,
			configPath,
			force,
			deep,
			generatorsConfig,
			processTerm,
			parentConfig: innerParentConfig,
		});
		setGlobalConfig({
			genFileExt: globalConfig?.genFileExt || GEN_FILE_EXT,
			genFileType: globalConfig?.genFileType || GEN_FILE_TYPE,
		});
		setRoots({ [ROOTS.PARENT]: parent });
	}
	return true;
};
