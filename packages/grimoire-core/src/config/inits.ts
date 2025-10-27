import type { Inits } from "../entities/Inits";

let inits: Partial<Inits> = {};

export const setInits = (newInits: Partial<Inits>) => {
	inits = { ...newInits };
};

export const getInits = (): Partial<Inits> => {
	return { ...inits };
};

export const clearInits = () => {
	inits = {};
};
