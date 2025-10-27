import fs from "node:fs";
import path from "node:path";
import { FilePathError } from "~/errors/FilePathError";

interface FindPlopPath {
	dir: string;
	defaultDir: string;
	namePlopFile: string;
}

export const findPlopPath = ({
	dir,
	defaultDir,
	namePlopFile,
}: FindPlopPath) => {
	if (fs.existsSync(path.join(dir, namePlopFile))) {
		return path.join(dir, namePlopFile);
	}

	if (fs.existsSync(path.join(defaultDir, namePlopFile))) {
		return path.join(defaultDir, namePlopFile);
	}

	throw new FilePathError(`The file "${namePlopFile}" does not exist.`);
};
