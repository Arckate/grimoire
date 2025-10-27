import path from "node:path";
import { fileURLToPath } from "node:url";

export const normalizePath = (p: string): string => {
	if (p.startsWith("file://")) {
		p = fileURLToPath(p);
	}
	return path.posix.normalize(p.replace(/\\/g, "/"));
};
