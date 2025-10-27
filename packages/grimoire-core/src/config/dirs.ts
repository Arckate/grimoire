import { DIRS } from "~/const/dirs";
import type { Dirs } from "~/entities/Dirs";

const dirs: Dirs = {
	[DIRS.DIR]: null,
	[DIRS.DEFAULT_DIR]: null,
	[DIRS.IN_PATH]: null,
};

export const setDirs = (newDirs: Partial<Dirs>) => {
	Object.entries(newDirs).forEach(([name, value]) => {
		if (value) {
			dirs[name] = value;
		}
	});
};

export const getDirs = (keyDirs: keyof Dirs) => {
	return dirs[keyDirs];
};

export const clearDirs = () => {
	Object.keys(dirs).forEach((name) => {
		dirs[name] = null;
	});
};
