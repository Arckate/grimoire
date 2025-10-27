import { getGlobalConfig } from "~/config/global";
import { CONFIG_FILE_EXT, CONFIG_FILE_TYPE } from "~/const/config";
import type { RecordCamelCase } from "~/entities/CmdConfig";

export const readConfigCliFile = (
	path: string,
): RecordCamelCase<string, string> => {
	const ext = getGlobalConfig()?.configFileExt || CONFIG_FILE_EXT;
	const type = getGlobalConfig()?.configFileType || CONFIG_FILE_TYPE;
	const findFile = getGlobalConfig()?.findFile || {};

	if (findFile?.[ext]?.[type]) {
		return findFile[ext][type].read(path);
	}
	throw new Error(`Find files ${ext} ${type} read function doesn't exist`);
};
