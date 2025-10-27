import { ROOTS } from "../const/roots";
import type { Roots } from "../entities/Roots";

const roots: Roots = {
	[ROOTS.PARENT]: null,
	[ROOTS.ROOT]: null,
};

export const setRoots = (newRoots: Partial<Roots>) => {
	Object.entries(newRoots).forEach(([name, value]) => {
		if (value) {
			roots[name] = value;
		}
	});
};

export const getRoots = (keyRoots: keyof Roots) => {
	return roots[keyRoots];
};

export const clearRoots = () => {
	Object.keys(roots).forEach((name) => {
		roots[name] = null;
	});
};
