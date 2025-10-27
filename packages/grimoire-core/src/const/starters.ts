import type { ArrayKey } from "~/cmd/starter/mergeObject";

export enum STARTER_TYPES {
	CMD_PLOP = "CmdPlop",
	INIT = "Init",
	FILE_PLOP = "FilePlop",
	STARTER = "Starter",
	MULTI_CHOICE = "MultiChoice",
	INPUT = "input",
	FILTER = "Filter",
	SET_VALUES = "SetValues",
	UNKNOWN = "UNKNOWN",
}

export const OTHER_GENERATOR: ArrayKey = [
	"in",
	"question",
	"initGenerator",
	"keyFilter",
	"starterName",
	"inputQuestion",
	"keys",
];

export const OTHER_IN: ArrayKey = [
	"generator",
	"initGenerator",
	"question",
	"keyFilter",
	"starterName",
	"inputQuestion",
	"keys",
];

export const OTHER_QUESTION: ArrayKey = [
	"generator",
	"initGenerator",
	"in",
	"keyFilter",
	"starterName",
	"inputQuestion",
	"keys",
];

export const OTHER_FILTER: ArrayKey = [
	"generator",
	"initGenerator",
	"in",
	"question",
	"starterName",
	"inputQuestion",
	"keys",
];

export const OTHER_STARTER: ArrayKey = [
	"generator",
	"initGenerator",
	"in",
	"question",
	"keyFilter",
	"inputQuestion",
	"keys",
];

export const OTHER_INIT: ArrayKey = [
	"generator",
	"in",
	"question",
	"keyFilter",
	"starterName",
	"inputQuestion",
	"keys",
];

export const OTHER_INPUT: ArrayKey = [
	"generator",
	"initGenerator",
	"in",
	"question",
	"keyFilter",
	"starterName",
	"keys",
];

export const OTHER_KEYS: ArrayKey = [
	"generator",
	"initGenerator",
	"in",
	"question",
	"keyFilter",
	"starterName",
	"inputQuestion",
];
