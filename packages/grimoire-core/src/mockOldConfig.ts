import { vi } from "vitest";
import type { CmdConfig } from "~/entities/CmdConfig";

const mockRead = vi.fn();
const mockWrite = vi.fn();
const mockStringTo = vi.fn();

const mockCmdInit = vi.fn();
const mockCmdExtract = vi.fn();
const mockCmdNew = vi.fn();
const mockCmdGen = vi.fn();
const mockCmdStart = vi.fn();

const mockCopy = vi.fn();
const mockAddFolder = vi.fn();
const mockCopyTo = vi.fn();
const mockAddTo = vi.fn();
const mockCopyFolder = vi.fn();

const mockOldConfig: CmdConfig = {
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
				read: mockRead,
				write: mockWrite,
				stringTo: mockStringTo,
			},
		},
	},
	commands: {
		init: {
			cmdFn: mockCmdInit,
			plop: "plopfile/init.plopfile.ts",
			config: "inits",
		},
		extract: {
			cmdFn: mockCmdExtract,
			plop: "plopfile/extract.plopfile.ts",
			config: "extracts",
		},
		new: {
			cmdFn: mockCmdNew,
			plop: "plopfile/plopfile.ts",
			config: "generators",
		},
		gen: {
			cmdFn: mockCmdGen,
			plop: "plopfile/plopfile.ts",
			config: "generators",
		},
		start: {
			cmdFn: mockCmdStart,
			plop: "plopfile/plopfile.ts",
			config: "starters",
		},
	},
	actions: {
		copy: mockCopy,
		addFolder: mockAddFolder,
		copyTo: mockCopyTo,
		addTo: mockAddTo,
		copyFolder: mockCopyFolder,
	},
};

export default mockOldConfig;
