import { getGlobalConfig } from "~/config/global";
import { GEN_FILE_EXT, GEN_FILE_TYPE } from "~/const/config";
import type { RecordCamelCase } from "~/entities/CmdConfig";
import type { GenObject } from "~/entities/GenObject";

export const readGenFile = (
	path: string,
	parentConfig: RecordCamelCase<string, string> | null,
): GenObject => {
	const ext =
		parentConfig?.genFileExt || getGlobalConfig()?.genFileExt || GEN_FILE_EXT;
	const type =
		parentConfig?.genFileType ||
		getGlobalConfig()?.genFileType ||
		GEN_FILE_TYPE;
	const findFile = getGlobalConfig()?.findFile || {};

	if (findFile?.[ext]?.[type]) {
		return findFile[ext][type].read(path) as GenObject;
	}
	throw new Error(`Find files ${ext} ${type} read function doesn't exist`);
};
