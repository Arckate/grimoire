let dirnames: Partial<Record<string, string>> = {};

export const setDirnames = (newDirnames: Partial<Record<string, string>>) => {
	dirnames = { ...newDirnames };
};

export const getDirnames = (): Partial<Record<string, string>> => {
	return { ...dirnames };
};

export const clearDirnames = () => {
	dirnames = {};
};
