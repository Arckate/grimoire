import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import merge from "lodash.merge";
import { ROOTS } from "./const";
import {
	CLI_FOLDER,
	DESCRIPTION,
	NAME,
	PLAN_EXT,
	PLAN_TYPE,
	VERSION,
} from "./const/config";
import type { ProcessTerm } from "./models";
import type { ConfCmd, Config } from "./models/Config";
import { findRoots } from "./path";
import { loggerErrorPrompt, loggerPrompt, removeLinePrompt, resultPrompt, searchGeneratorPrompt, spinnerPrompt, typeGeneratorsPrompt, workflowNamePrompt } from "./prompts";
import { loadConfig } from "./utils";

export class Cli<
	TGlobals extends Record<string, any> = Record<string, any>,
	TActions extends Record<string, any> = Record<string, any>,
	TPrompts extends Record<string, any> = Record<string, any>,
	TConfCmds extends Record<string, ConfCmd> = Record<string, ConfCmd>,
	TConfig extends Config = Config,
	TDirs extends Record<string, string> = Record<string, string>,
> {
	private config: TConfig = {} as TConfig;
	private confCmds: TConfCmds = {} as TConfCmds;
	private processTerm: ProcessTerm;
	private actions: TActions = {} as TActions;
	private prompts: TPrompts = {} as TPrompts;
	private dirs: TDirs = {} as TDirs;
	private globals: TGlobals = {} as TGlobals;

	private constructor(processTerm: ProcessTerm, prompts: TPrompts) {
		this.processTerm = processTerm;
		this.prompts = prompts;
	}

	static init() {
		const processTerm = {
			stdin: process.stdin,
			stderr: process.stderr,
			stdout: process.stdout,
			exit: process.exit,
			cwd: process.cwd,
		};

		const prompts = {
			cliLoggerError: loggerErrorPrompt,
			cliLogger: loggerPrompt,
			cliRemoveLine: removeLinePrompt,
			cliResult: resultPrompt ,
			cliSearchGenerator: searchGeneratorPrompt,
			cliSpinner: spinnerPrompt,
			cliTypeGenerators: typeGeneratorsPrompt,
			cliWorkflowName: workflowNamePrompt,
		};
		return new Cli(processTerm, prompts);
	}

	public merge<TOtherCli extends Cli<any, any, any, any, any, any>>(
		cli: TOtherCli,
	): this {
		this.addConfig(cli.getConfig());
		return this;
	}

	public clear(): Cli {
		this.setConfig({} as TConfig);
		return this;
	}

	public getProcessTerm(): ProcessTerm {
		return this.processTerm;
	}

	// --- actions ---

	public addActions<TNewActions extends Record<string, any>>(
		actions: TNewActions,
	): Cli<
		TGlobals,
		TActions & TNewActions,
		TPrompts,
		TConfCmds,
		TConfig,
		TDirs
	> {
		this.actions = merge(this.actions, actions) as TActions & TNewActions;
		return this as unknown as Cli<
			TGlobals,
			TActions & TNewActions,
			TPrompts,
			TConfCmds,
			TConfig,
			TDirs
		>;
	}

	public setActions<TNewActions extends Record<string, any>>(
		actions: TNewActions,
	): Cli<TGlobals, TNewActions, TPrompts, TConfCmds, TConfig, TDirs> {
		this.actions = actions as unknown as TActions;
		return this as unknown as Cli<
			TGlobals,
			TNewActions,
			TPrompts,
			TConfCmds,
			TConfig,
			TDirs
		>;
	}

	public getActions(): TActions {
		return this.actions;
	}

	// --- prompts ---

	public addPrompts<TNewPrompts extends Record<string, any>>(
		prompts: TNewPrompts,
	): Cli<
		TGlobals,
		TActions,
		TPrompts & TNewPrompts,
		TConfCmds,
		TConfig,
		TDirs
	> {
		this.prompts = merge(this.prompts, prompts) as TPrompts & TNewPrompts;
		return this as unknown as Cli<
			TGlobals,
			TActions,
			TPrompts & TNewPrompts,
			TConfCmds,
			TConfig,
			TDirs
		>;
	}

	public setPrompts<TNewPrompts extends Record<string, any>>(
		prompts: TNewPrompts,
	): Cli<TGlobals, TActions, TNewPrompts, TConfCmds, TConfig, TDirs> {
		this.prompts = prompts as unknown as TPrompts;
		return this as unknown as Cli<
			TGlobals,
			TActions,
			TNewPrompts,
			TConfCmds,
			TConfig,
			TDirs
		>;
	}

	public getPrompts(): TPrompts {
		return this.prompts;
	}

	// --- confCmds ---

	public addConfCmds<TNewConfCmds extends Record<string, ConfCmd>>(
		confCmds: TNewConfCmds,
	): Cli<
		TGlobals,
		TActions,
		TPrompts,
		TConfCmds & TNewConfCmds,
		TConfig,
		TDirs
	> {
		Object.entries(confCmds).forEach(([name, confCmd]) => {
			const current = (this.confCmds as Record<string, ConfCmd>)[name];
			if (confCmd?.merge) {
				(this.confCmds as Record<string, ConfCmd>)[name] = {
					config: confCmd.merge(current?.config || {}, confCmd.config || {}),
					merge: confCmd.merge,
				};
				return;
			}
			if (current?.merge) {
				(this.confCmds as Record<string, ConfCmd>)[name] = {
					config: current.merge(current?.config || {}, confCmd.config || {}),
					merge: current.merge,
				};
				return;
			}
			(this.confCmds as Record<string, ConfCmd>)[name] = {
				config: merge(current?.config || {}, confCmd.config || {}),
			};
		});
		return this as unknown as Cli<
			TGlobals,
			TActions,
			TPrompts,
			TConfCmds & TNewConfCmds,
			TConfig,
			TDirs
		>;
	}

	public setConfCmds<TNewConfCmds extends Record<string, ConfCmd>>(
		confCmds: TNewConfCmds,
	): Cli<TGlobals, TActions, TPrompts, TNewConfCmds, TConfig, TDirs> {
		this.confCmds = confCmds as unknown as TConfCmds;
		return this as unknown as Cli<
			TGlobals,
			TActions,
			TPrompts,
			TNewConfCmds,
			TConfig,
			TDirs
		>;
	}

	public getConfCmds(): TConfCmds {
		return this.confCmds;
	}

	public getConfCmd<K extends keyof TConfCmds>(configKey: K): TConfCmds[K];
	public getConfCmd<TConfig = unknown>(configKey: string): ConfCmd<TConfig>;
	public getConfCmd(configKey: string): ConfCmd {
		return this.confCmds[configKey];
	}

	// --- config ---

	public addConfig<
		TNewConfCmds extends Record<string, ConfCmd>,
		TNewConfig extends Config<TNewConfCmds>,
	>(
		config: TNewConfig,
	): Cli<
		TGlobals,
		TActions,
		TPrompts,
		TConfCmds & TNewConfCmds,
		TConfig & TNewConfig,
		TDirs
	> {
		this.config = merge(this.config, config) as TConfig & TNewConfig;
		this.addActions(config.actions || {});
		this.addPrompts(config.prompts || {});
		this.addConfCmds((config.confCmds || {}) as TNewConfCmds);
		this.addGlobals(config.globals || {});
		return this as unknown as Cli<
			TGlobals,
			TActions,
			TPrompts,
			TConfCmds & TNewConfCmds,
			TConfig & TNewConfig,
			TDirs
		>;
	}

	public setConfig<TNewConfig extends Config>(
		config: TNewConfig,
	): Cli<TGlobals, TActions, TPrompts, TConfCmds, TNewConfig, TDirs> {
		this.config = config as unknown as TConfig;
		this.setActions(config.actions || {});
		this.setPrompts(config.prompts || {});
		this.setConfCmds(config.confCmds || {});
		this.setGlobals(config.globals || {});
		return this as unknown as Cli<
			TGlobals,
			TActions,
			TPrompts,
			TConfCmds,
			TNewConfig,
			TDirs
		>;
	}

	public getConfig(): TConfig {
		return this.config;
	}

	// --- dirs ---

	public addDirs<TNewDirs extends Record<string, string>>(
		dirs: TNewDirs,
	): Cli<TGlobals, TActions, TPrompts, TConfCmds, TConfig, TDirs & TNewDirs> {
		this.dirs = { ...this.dirs, ...dirs } as TDirs & TNewDirs;
		return this as unknown as Cli<
			TGlobals,
			TActions,
			TPrompts,
			TConfCmds,
			TConfig,
			TDirs & TNewDirs
		>;
	}

	public setDirs<TNewDirs extends Record<string, string>>(
		dirs: TNewDirs,
	): Cli<TGlobals, TActions, TPrompts, TConfCmds, TConfig, TNewDirs> {
		this.dirs = dirs as unknown as TDirs;
		return this as unknown as Cli<
			TGlobals,
			TActions,
			TPrompts,
			TConfCmds,
			TConfig,
			TNewDirs
		>;
	}

	public getDirs(): TDirs {
		return this.dirs;
	}

	public getDir(key: string): string | null {
		return this.dirs[key] || null;
	}

	// --- globals ---

	public addGlobals<TNewGlobals extends Record<string, any>>(
		globals: TNewGlobals,
	): Cli<
		TGlobals & TNewGlobals,
		TActions,
		TPrompts,
		TConfCmds,
		TConfig,
		TDirs
	> {
		this.globals = { ...this.globals, ...globals } as TGlobals & TNewGlobals;
		return this as unknown as Cli<
			TGlobals & TNewGlobals,
			TActions,
			TPrompts,
			TConfCmds,
			TConfig,
			TDirs
		>;
	}

	public setGlobals<TNewGlobals extends Record<string, any>>(
		globals: TNewGlobals,
	): Cli<TNewGlobals, TActions, TPrompts, TConfCmds, TConfig, TDirs> {
		this.globals = globals as unknown as TGlobals;
		return this as unknown as Cli<
			TNewGlobals,
			TActions,
			TPrompts,
			TConfCmds,
			TConfig,
			TDirs
		>;
	}

	public getGlobals(): TGlobals {
		return this.globals;
	}

	// --- snapshot ---

	public getData() {
		return {
			config: this.getConfig(),
			confCmds: this.getConfCmds(),
			processTerm: this.getProcessTerm(),
			actions: this.getActions(),
			prompts: this.getPrompts(),
			dirs: this.getDirs(),
			globals: this.getGlobals(),
		};
	}

	public getDataEngine() {
		const config = this.getConfig();
		const globals = this.getGlobals();
		return {
			processTerm: this.getProcessTerm(),
			dest: globals.dest ?? this.processTerm.cwd(),
			globals,
			dirnames: this.getDirs(),
			actions: this.getActions(),
			prompts: this.getPrompts(),
			tools: {
				templating: config.templating ?? {},
				processor: config.processor ?? {},
			},
			config,
			force: false,
		};
	}

	// --- internal ---

	private async addCurrentConfig(): Promise<void> {
		const { [ROOTS.ROOT]: root } = findRoots({
			processTerm: this.processTerm,
			config: this.getConfig(),
			findRoot: true,
		});
		this.addDirs({ [ROOTS.ROOT]: root });

		if (
			root &&
			(fs.existsSync(
				path.join(root, `${this.config.cliFolder || CLI_FOLDER}/config.ts`),
			) ||
				fs.existsSync(
					path.join(root, `${this.config.cliFolder || CLI_FOLDER}/config.js`),
				))
		) {
			const { default: conf } = await loadConfig(
				path.join(root, `${this.config.cliFolder || CLI_FOLDER}/config`),
			);
			this.addConfig(conf);
		}

		this.addGlobals({
			currentPlanExt: this.config.planExt || PLAN_EXT,
			currentPlanType: this.config.planType || PLAN_TYPE,
		});
	}

	public async run(): Promise<this> {
		this.prompts.cliLogger({ message: "", keyValue: "", config: { args: [""] }, processTerm: this.processTerm });
		const spinner = await this.prompts.cliSpinner({ message: "", keyValue: "", config: {}, processTerm: this.processTerm });
		await this.addCurrentConfig();
		const program = new Command();
		program
			.name(this.config.name || NAME)
			.description(this.config.description || DESCRIPTION)
			.version(this.config.version || VERSION);

		for (const [name, { cmdFn, configKey = "" }] of Object.entries(
			this.config.cmds || {},
		)) {
			if (cmdFn) {
				cmdFn({
					program,
					name,
					configKey,
					cli: this,
					stopSpinner: () => spinner.stop(),
				});
			}
		}

		program.parse();
		spinner.stop();
		return this;
	}
}
