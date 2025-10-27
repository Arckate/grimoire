import { getGlobalConfig } from "@arckate/grimoire-core/config";
import {
	CLI_FOLDER,
	CONFIG_FILE,
	CONFIG_FILE_EXT,
	CONFIG_FILE_TYPE,
	DESCRIPTION,
	DIRNAMES_FILE,
	GEN_FILE_EXT,
	GEN_FILE_TYPE,
	NAME,
	ROOT_KEY,
	VERSION,
} from "@arckate/grimoire-core/const";
import type { FnConfig } from "@arckate/grimoire-core/entities";

export const constructorConfig = (): FnConfig => {
	const globalConfig = getGlobalConfig();
	let findFile = {};
	if (globalConfig.findFile) {
		findFile = Object.entries(globalConfig.findFile).reduce<
			FnConfig["findFile"]
		>((newFindFile, [key, values]) => {
			newFindFile[key] = Object.keys(values);
			return newFindFile;
		}, {});
	}
	return {
		name: globalConfig.name || NAME,
		description: globalConfig.description || DESCRIPTION,
		version: globalConfig.version || VERSION,
		cliFolder: globalConfig.cliFolder || CLI_FOLDER,
		rootKey: globalConfig.rootKey || ROOT_KEY,
		dirnamesFile: globalConfig.dirnamesFile || DIRNAMES_FILE,
		configFile: globalConfig.configFile || CONFIG_FILE,
		configFileExt: globalConfig.configFileExt || CONFIG_FILE_EXT,
		configFileType: globalConfig.configFileType || CONFIG_FILE_TYPE,
		genFileExt: globalConfig.genFileExt || GEN_FILE_EXT,
		genFileType: globalConfig.genFileExt || GEN_FILE_TYPE,
		findFile,
	};
};
