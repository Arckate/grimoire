import { CONFIG_FILE_EXT, CONFIG_FILE_TYPE } from "~/const";
import type { Config, RecordCamelCase } from "~/models";

export const readConfigCliFile = (
	config: Config,
	path: string,
): RecordCamelCase<string, string> => {
	const ext = config?.configFileExt || CONFIG_FILE_EXT;
	const type = config?.configFileType || CONFIG_FILE_TYPE;
	const processor = config?.processor || {};

	if (processor?.[ext]?.[type]) {
		return processor[ext][type].read(path);
	}
	throw new Error(`Find files ${ext} ${type} read function doesn't exist`);
};
