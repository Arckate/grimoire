import type { CmdConfig } from "@arckate/grimoire-core/entities";
import { addFolder } from "~/src/actions/addFolder";
import { addTo } from "~/src/actions/addTo";
import { copy } from "~/src/actions/copy";
import { copyFolder } from "~/src/actions/copyFolder";
import { copyTo } from "~/src/actions/copyTo";
import { cmdExtract } from "~/src/cmd/cmdExtract";
import { cmdGen } from "~/src/cmd/cmdGen";
import { cmdInit } from "~/src/cmd/cmdInit";
import { cmdNew } from "~/src/cmd/cmdNew";
import { cmdStart } from "~/src/cmd/cmdStart";
import {
	readCamelCaseJson,
	stringToCamelCaseJson,
	writeCamelCaseJson,
} from "~/src/files/findCamelCaseJson";

const config: CmdConfig = {
	name: "grim",
	cliFolder: ".cli",
	rootKey: "root", //camelCase
	dirnamesFile: "dirnames",
	description: "CLI to some JavaScript string utilities",
	version: "0.0.0",
	configFile: "config.cli",
	configFileExt: "json",
	configFileType: "camelCase",
	genFileExt: "json",
	genFileType: "camelCase",
	findFile: {
		json: {
			camelCase: {
				read: readCamelCaseJson,
				write: writeCamelCaseJson,
				stringTo: stringToCamelCaseJson,
			},
		},
	},
	commands: {
		init: {
			cmdFn: cmdInit,
			plop: "plopfile/init.plopfile.ts",
			config: "inits",
		},
		extract: {
			cmdFn: cmdExtract,
			plop: "plopfile/extract.plopfile.ts",
			config: "extracts",
		},
		new: { cmdFn: cmdNew, plop: "plopfile/plopfile.ts", config: "generators" },
		gen: { cmdFn: cmdGen, plop: "plopfile/plopfile.ts", config: "generators" },
		start: {
			cmdFn: cmdStart,
			plop: "plopfile/plopfile.ts",
			config: "starters",
		},
	},
	actions: {
		copy,
		addFolder,
		copyTo,
		addTo,
		copyFolder,
	},
};

export default config;
