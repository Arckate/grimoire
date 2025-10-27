import path from "node:path";

export const normalizePath = (currentPath: string) => {
	return !path.sep || path.sep === "\\"
		? currentPath.replace(/\\/g, "/")
		: currentPath;
};
