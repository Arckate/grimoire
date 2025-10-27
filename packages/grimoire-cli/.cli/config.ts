import {
	defineConfig,
	mergeFlowsConfig,
	mergeGenerators,
} from "@arckate/grimoire-core/config";
import { addFolder } from "~/src/actions/addFolder";
import { addTo } from "~/src/actions/addTo";
import { copy } from "~/src/actions/copy";
import { copyFolder } from "~/src/actions/copyFolder";
import { copyTo } from "~/src/actions/copyTo";
import { cmdFlow } from "~/src/handlers/flows/cmdFlow";
import { cmdGen } from "~/src/handlers/gens/cmdGen";
import { cmdGenExtract } from "~/src/handlers/gens/cmdGenExtract";
import { cmdGenInit } from "~/src/handlers/gens/cmdGenInit";
import { cmdInit } from "~/src/handlers/inits/cmdInit";
import { cmdPlan } from "~/src/handlers/plans/cmdPlan";
import {
	readCamelCaseJson,
	stringToCamelCaseJson,
	writeCamelCaseJson,
} from "~/src/processor/processCamelCaseJson";
import extracts from "./extracts";
import flows from "./flows";
import generators from "./generators";
import inits from "./inits";

generators;

const config = defineConfig({
	name: "grim",
	cliFolder: ".cli",
	rootKey: "root", //camelCase
	dirnamesFile: "dirnames",
	description: "CLI to some JavaScript string utilities",
	version: "0.0.0",
	configFile: "config.cli",
	configFileExt: "json",
	configFileType: "camelCase",
	planExt: "json",
	planType: "camelCase",
	processor: {
		json: {
			camelCase: {
				read: readCamelCaseJson,
				write: writeCamelCaseJson,
				stringTo: stringToCamelCaseJson,
			},
		},
	},
	cmds: {
		init: { cmdFn: cmdInit, configKey: "inits" },
		"gen:init": { cmdFn: cmdGenInit, configKey: "inits" },
		"gen:extract": { cmdFn: cmdGenExtract, configKey: "extracts" },
		gen: { cmdFn: cmdGen, configKey: "generators" },
		plan: { cmdFn: cmdPlan, configKey: "generators" },
		flow: { cmdFn: cmdFlow, configKey: "flows" },
	},
	templateType: "handlebars",
	templating: {
		handlebars: {
			render: () => {},
			options: {},
		},
	},
	confCmds: {
		inits: { config: inits },
		generators: { config: generators, merge: mergeGenerators },
		extracts: { config: extracts },
		flows: { config: flows, merge: mergeFlowsConfig },
	},
	actions: {
		copy,
		addFolder,
		copyTo,
		addTo,
		copyFolder,
	},
	prompts: {
		input: () => {},
	},
});

export default config;
