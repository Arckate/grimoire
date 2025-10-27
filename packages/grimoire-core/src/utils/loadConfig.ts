export const loadConfig = async (filePath: string) => {
	return await import(filePath);
};
