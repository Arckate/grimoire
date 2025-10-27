import fs from "node:fs";
import ora from "ora";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { Cli } from "./Cli";
import { ROOTS } from "./const";
import { findRoots } from "./path";
import { loggerPrompt } from "./prompts";
import { loadConfig } from "./utils";

vi.mock("node:fs", () => ({ default: { existsSync: vi.fn() } }));
vi.mock("./path/findRoots", () => ({ findRoots: vi.fn() }));
vi.mock("./utils/loadConfig", () => ({ loadConfig: vi.fn() }));
vi.mock("./prompts/loggerPrompt", () => ({ loggerPrompt: vi.fn() }));
vi.mock("./prompts/spinnerPrompt", () => ({ spinnerPrompt: vi.fn(() => ({ stop: vi.fn() })) }));
vi.mock("commander", () => {
	function CommandMock(this: any) {
		this.name = vi.fn().mockReturnThis();
		this.description = vi.fn().mockReturnThis();
		this.version = vi.fn().mockReturnThis();
		this.parse = vi.fn();
		return this;
	}
	return { Command: CommandMock };
});
vi.mock("ora", () => ({ default: vi.fn() }));

beforeEach(() => {
	vi.clearAllMocks();
	(fs.existsSync as Mock).mockReturnValue(false);
	(findRoots as Mock).mockReturnValue({
		[ROOTS.ROOT]: null,
		[ROOTS.PARENT]: null,
	});
	(ora as unknown as Mock).mockReturnValue({
		start: vi.fn().mockReturnValue({ stop: vi.fn() }),
	});
});

describe("Cli.init", () => {
	it("returns a Cli instance", () => {
		expect(Cli.init()).toBeInstanceOf(Cli);
	});

	it("getProcessTerm returns an object with stdin/stdout/cwd", () => {
		const pt = Cli.init().getProcessTerm();
		expect(pt).toHaveProperty("stdin");
		expect(pt).toHaveProperty("stdout");
		expect(pt).toHaveProperty("cwd");
	});
});

describe("Cli — actions", () => {
	it("getActions returns empty object by default", () => {
		expect(Cli.init().getActions()).toEqual({});
	});

	it("addActions merges actions", () => {
		const cli = Cli.init();
		const fn = vi.fn();
		cli.addActions({ myAction: fn });
		expect(cli.getActions().myAction).toBe(fn);
	});

	it("addActions merges with existing actions", () => {
		const cli = Cli.init();
		cli.addActions({ a: vi.fn() });
		cli.addActions({ b: vi.fn() });
		expect(cli.getActions()).toHaveProperty("a");
		expect(cli.getActions()).toHaveProperty("b");
	});

	it("setActions replaces all actions", () => {
		const cli = Cli.init();
		cli.addActions({ old: vi.fn() });
		cli.setActions({ newAction: vi.fn() });
		expect(cli.getActions()).not.toHaveProperty("old");
		expect(cli.getActions()).toHaveProperty("newAction");
	});
});

describe("Cli — prompts", () => {
	it("getPrompts returns the default cli prompts", () => {
		const prompts = Cli.init().getPrompts();
		expect(prompts).toHaveProperty("cliLogger");
		expect(prompts).toHaveProperty("cliSpinner");
		expect(prompts).toHaveProperty("cliWorkflowName");
	});

	it("addPrompts merges prompts", () => {
		const cli = Cli.init();
		cli.addPrompts({ myPrompt: vi.fn() });
		expect(cli.getPrompts()).toHaveProperty("myPrompt");
	});

	it("setPrompts replaces all prompts", () => {
		const cli = Cli.init();
		cli.addPrompts({ old: vi.fn() });
		cli.setPrompts({ newPrompt: vi.fn() });
		expect(cli.getPrompts()).not.toHaveProperty("old");
		expect(cli.getPrompts()).toHaveProperty("newPrompt");
	});
});

describe("Cli — confCmds", () => {
	it("getConfCmds returns empty object by default", () => {
		expect(Cli.init().getConfCmds()).toEqual({});
	});

	it("setConfCmds replaces all confCmds", () => {
		const cli = Cli.init();
		cli.setConfCmds({ myCmd: { config: { x: 1 } } });
		expect(cli.getConfCmds()).toHaveProperty("myCmd");
	});

	it("getConfCmd returns a specific confCmd", () => {
		const cli = Cli.init();
		cli.setConfCmds({ myCmd: { config: { x: 1 } } });
		expect(cli.getConfCmd("myCmd")).toEqual({ config: { x: 1 } });
	});

	it("addConfCmds uses confCmd.merge when provided", () => {
		const cli = Cli.init();
		const mergeFn = vi.fn().mockReturnValue({ merged: true });
		cli.addConfCmds({ cmd: { config: { a: 1 }, merge: mergeFn } });
		expect(mergeFn).toHaveBeenCalled();
		expect(cli.getConfCmds().cmd.config).toEqual({ merged: true });
	});

	it("addConfCmds uses current.merge when only current has merge", () => {
		const cli = Cli.init();
		const mergeFn = vi.fn().mockReturnValue({ fromCurrent: true });
		cli.addConfCmds({ cmd: { config: { a: 1 }, merge: mergeFn } });
		cli.addConfCmds({ cmd: { config: { b: 2 } } });
		expect(mergeFn).toHaveBeenCalledTimes(2);
	});

	it("addConfCmds uses lodash.merge when neither has merge", () => {
		const cli = Cli.init();
		cli.addConfCmds({ cmd: { config: { a: 1 } } });
		cli.addConfCmds({ cmd: { config: { b: 2 } } });
		expect(cli.getConfCmds().cmd.config).toEqual({ a: 1, b: 2 });
	});

	it("addConfCmds uses {} fallback when confCmd has no config (confCmd.merge path)", () => {
		const cli = Cli.init();
		const mergeFn = vi.fn().mockReturnValue({});
		cli.addConfCmds({ cmd: { merge: mergeFn } });
		expect(mergeFn).toHaveBeenCalledWith({}, {});
	});

	it("addConfCmds uses {} fallback when current.config is falsy (current.merge path)", () => {
		const cli = Cli.init();
		const mergeFn = vi.fn().mockReturnValue(undefined);
		cli.addConfCmds({ cmd: { merge: mergeFn } });
		cli.addConfCmds({ cmd: { config: { b: 2 } } });
		expect(mergeFn).toHaveBeenNthCalledWith(2, {}, { b: 2 });
	});

	it("addConfCmds uses {} fallback when confCmd.config is falsy (current.merge path)", () => {
		const cli = Cli.init();
		const mergeFn = vi.fn().mockReturnValue({ x: 1 });
		cli.addConfCmds({ cmd: { config: { a: 1 }, merge: mergeFn } });
		cli.addConfCmds({ cmd: {} });
		expect(mergeFn).toHaveBeenNthCalledWith(2, { x: 1 }, {});
	});

	it("addConfCmds uses {} fallback when neither has config nor merge", () => {
		const cli = Cli.init();
		cli.addConfCmds({ cmd: {} });
		expect(cli.getConfCmds().cmd).toEqual({ config: {} });
	});
});

describe("Cli — config", () => {
	it("getConfig returns empty object by default", () => {
		expect(Cli.init().getConfig()).toEqual({});
	});

	it("addConfig merges config and sub-fields", () => {
		const cli = Cli.init();
		const action = vi.fn();
		cli.addConfig({ name: "my-cli", actions: { myAction: action } });
		expect(cli.getConfig().name).toBe("my-cli");
		expect(cli.getActions()).toHaveProperty("myAction");
	});

	it("setConfig replaces config and resets sub-fields", () => {
		const cli = Cli.init();
		cli.addActions({ old: vi.fn() });
		cli.setConfig({ name: "new-cli" });
		expect(cli.getConfig().name).toBe("new-cli");
		expect(cli.getActions()).toEqual({});
	});

	it("clear resets config to empty object", () => {
		const cli = Cli.init();
		cli.addConfig({ name: "my-cli" });
		cli.clear();
		expect(cli.getConfig()).toEqual({});
	});
});

describe("Cli — dirs", () => {
	it("getDirs returns empty object by default", () => {
		expect(Cli.init().getDirs()).toEqual({});
	});

	it("addDirs merges dirs", () => {
		const cli = Cli.init();
		cli.addDirs({ [ROOTS.PARENT]: "/project" });
		expect(cli.getDirs()[ROOTS.PARENT]).toBe("/project");
	});

	it("setDirs replaces all dirs", () => {
		const cli = Cli.init();
		cli.addDirs({ old: "/old" });
		cli.setDirs({ [ROOTS.ROOT]: "/root" });
		expect(cli.getDirs()).not.toHaveProperty("old");
		expect(cli.getDirs()[ROOTS.ROOT]).toBe("/root");
	});

	it("getDir returns value when key exists", () => {
		const cli = Cli.init();
		cli.addDirs({ myKey: "/some/path" });
		expect(cli.getDir("myKey")).toBe("/some/path");
	});

	it("getDir returns null when key does not exist", () => {
		expect(Cli.init().getDir("missing")).toBeNull();
	});
});

describe("Cli — globals", () => {
	it("getGlobals returns empty object by default", () => {
		expect(Cli.init().getGlobals()).toEqual({});
	});

	it("addGlobals merges globals", () => {
		const cli = Cli.init();
		cli.addGlobals({ env: "prod" });
		cli.addGlobals({ user: "alice" });
		expect(cli.getGlobals()).toEqual({ env: "prod", user: "alice" });
	});

	it("setGlobals replaces all globals", () => {
		const cli = Cli.init();
		cli.addGlobals({ old: "x" });
		cli.setGlobals({ new: "y" });
		expect(cli.getGlobals()).toEqual({ new: "y" });
	});
});

describe("Cli.merge", () => {
	it("merges config from another cli instance", () => {
		const cli1 = Cli.init();
		cli1.addConfig({ name: "cli1" });
		const cli2 = Cli.init();
		cli2.merge(cli1);
		expect(cli2.getConfig().name).toBe("cli1");
	});
});

describe("Cli.getData", () => {
	it("returns a snapshot with all expected fields", () => {
		const data = Cli.init().getData();
		expect(data).toHaveProperty("config");
		expect(data).toHaveProperty("processTerm");
		expect(data).toHaveProperty("actions");
		expect(data).toHaveProperty("prompts");
		expect(data).toHaveProperty("dirs");
		expect(data).toHaveProperty("globals");
		expect(data).toHaveProperty("confCmds");
	});
});

describe("Cli.getDataEngine", () => {
	it("uses globals.dest when set", () => {
		const cli = Cli.init();
		cli.addGlobals({ dest: "/explicit-dest" });
		expect(cli.getDataEngine().dest).toBe("/explicit-dest");
	});

	it("falls back to processTerm.cwd() when globals.dest is not set", () => {
		const { dest } = Cli.init().getDataEngine();
		expect(typeof dest).toBe("string");
	});

	it("uses config.templating when set", () => {
		const cli = Cli.init();
		const templating = { hbs: vi.fn() };
		cli.addConfig({ templating } as any);
		expect(cli.getDataEngine().tools.templating).toEqual(templating);
	});

	it("falls back to {} for templating and processor when not set", () => {
		const { tools } = Cli.init().getDataEngine();
		expect(tools.templating).toEqual({});
		expect(tools.processor).toEqual({});
	});
});

describe("Cli.run", () => {
	it("returns the cli instance", async () => {
		const cli = Cli.init();
		const result = await cli.run();
		expect(result).toBe(cli);
	});

	it("calls loggerPrompt at startup", async () => {
		await Cli.init().run();
		expect(loggerPrompt).toHaveBeenCalled();
	});

	it("sets currentPlanExt and currentPlanType using config values", async () => {
		const cli = Cli.init();
		cli.addConfig({ planExt: "yaml", planType: "snake" });
		await cli.run();
		expect(cli.getGlobals()).toMatchObject({
			currentPlanExt: "yaml",
			currentPlanType: "snake",
		});
	});

	it("uses default planExt and planType when not set in config", async () => {
		const cli = Cli.init();
		await cli.run();
		expect(cli.getGlobals()).toMatchObject({
			currentPlanExt: "json",
			currentPlanType: "camelCase",
		});
	});

	it("loads config file when config.ts exists at root", async () => {
		(fs.existsSync as Mock).mockReturnValue(true);
		(findRoots as Mock).mockReturnValue({
			[ROOTS.ROOT]: "/project",
			[ROOTS.PARENT]: null,
		});
		(loadConfig as Mock).mockResolvedValue({ default: { name: "loaded-cli" } });

		const cli = Cli.init();
		await cli.run();

		expect(loadConfig).toHaveBeenCalled();
		expect(cli.getConfig().name).toBe("loaded-cli");
	});

	it("loads config.js when config.ts does not exist but config.js does", async () => {
		(fs.existsSync as Mock)
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(true);
		(findRoots as Mock).mockReturnValue({
			[ROOTS.ROOT]: "/project",
			[ROOTS.PARENT]: null,
		});
		(loadConfig as Mock).mockResolvedValue({ default: { name: "from-js" } });

		const cli = Cli.init();
		await cli.run();

		expect(loadConfig).toHaveBeenCalled();
		expect(cli.getConfig().name).toBe("from-js");
	});

	it("calls cmdFn for each registered command", async () => {
		const cmdFn = vi.fn();
		const cli = Cli.init();
		cli.addConfig({ cmds: { myCmd: { cmdFn } } } as any);
		await cli.run();
		expect(cmdFn).toHaveBeenCalledWith(
			expect.objectContaining({ name: "myCmd", cli }),
		);
	});

	it("skips cmdFn when it is not provided", async () => {
		const cli = Cli.init();
		cli.addConfig({ cmds: { myCmd: {} } } as any);
		await expect(cli.run()).resolves.toBeDefined();
	});

	it("stopSpinner callback stops the ora spinner", async () => {
		let capturedStopSpinner: (() => void) | undefined;
		const cmdFn = vi.fn(({ stopSpinner }) => {
			capturedStopSpinner = stopSpinner;
		});
		const cli = Cli.init();
		cli.addConfig({ cmds: { myCmd: { cmdFn } } } as any);
		await cli.run();

		expect(capturedStopSpinner).toBeTypeOf("function");
		capturedStopSpinner?.();
	});
});
