import { GEN_FILE_EXT } from "~/const/config";
import type { RecordCamelCase } from "~/entities/CmdConfig";
import { FilePathError } from "~/errors/FilePathError";
import { findAllGenFile } from "~/path/findAllGenFile";
import { isGenFile } from "~/path/isGenFile";
import { pathConstructor } from "~/path/pathConstructor";
import { pathValidating } from "~/path/pathValidating";
import type { ProcessTerm } from "../entities/ProcessTerm";

type filePlopFn = (argsList: string[]) => Promise<void>;
interface FindFilePlopArgsParams {
	filePlopFn: filePlopFn;
	inPath?: string;
	parentConfig: RecordCamelCase<string, string> | null;
	processTerm: ProcessTerm;
}

export const findFilePlopArgs = async ({
	filePlopFn,
	inPath,
	parentConfig,
	processTerm,
}: FindFilePlopArgsParams): Promise<void> => {
	const toGenFiles = await pathConstructor(inPath);
	const { isValidPath, isDirectory, isFile } = await pathValidating(
		processTerm,
		toGenFiles,
	);
	if (isValidPath) {
		const argsList: string[] = [];
		if (isDirectory) {
			const allGenFiles = await findAllGenFile(toGenFiles);
			argsList.push(...allGenFiles);
		} else if (isFile && isGenFile(toGenFiles, parentConfig)) {
			argsList.push(toGenFiles);
		} else {
			throw new FilePathError(
				`Only ".gen.${parentConfig?.genFileExt || GEN_FILE_EXT}" files are allowed.`,
			);
		}
		if (argsList.length) {
			await filePlopFn(argsList);
		}
	}
};
