import type { ArrayKey } from "~/cmd/starter/mergeObject";

export enum STARTER_TYPES {
	CMD_PLOP = "CmdPlop",
	FILE_PLOP = "FilePlop",
	STARTER = "Starter",
	MULTI_CHOICE = "MultiChoice",
	FILTER = "Filter",
	INIT = "Init",
	UNKNOWN = "UNKNOWN",
}

export const OTHER_GENERATOR: ArrayKey = [
	"in",
	"question",
	"initGenerator",
	"keyFilter",
	"starterName",
];

export const OTHER_IN: ArrayKey = [
	"generator",
	"initGenerator",
	"question",
	"keyFilter",
	"starterName",
];

export const OTHER_QUESTION: ArrayKey = [
	"generator",
	"initGenerator",
	"in",
	"keyFilter",
	"starterName",
];

export const OTHER_FILTER: ArrayKey = [
	"generator",
	"initGenerator",
	"in",
	"question",
	"starterName",
];

export const OTHER_STARTER: ArrayKey = [
	"generator",
	"initGenerator",
	"in",
	"question",
	"keyFilter",
];

export const OTHER_INIT: ArrayKey = [
	"generator",
	"in",
	"question",
	"keyFilter",
	"starterName",
];
