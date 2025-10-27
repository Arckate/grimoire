import fs from "node:fs";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import { resolveCliPath } from "~/path";
import { loadConfig } from "~/utils";
import { loadGlobals } from "./loadGlobals";

vi.mock("node:fs", () => ({ default: { readFileSync: vi.fn() } }));
vi.mock("~/path/resolveCliPath", () => ({ resolveCliPath: vi.fn() }));
vi.mock("~/utils/loadConfig", () => ({ loadConfig: vi.fn() }));

const makeCli = (): Cli => ({ addGlobals: vi.fn() }) as unknown as Cli;

beforeEach(() => {
	vi.resetAllMocks();
});

describe("loadGlobals — globalsFile", () => {
	it("reads and parses a JSON file then calls cli.addGlobals", async () => {
		const cli = makeCli();
		const globals = { env: "prod" };
		(resolveCliPath as Mock).mockReturnValue("/abs/globals.json");
		(fs.readFileSync as Mock).mockReturnValue(JSON.stringify(globals));

		await loadGlobals(cli, { globalsFile: "globals.json" });

		expect(resolveCliPath).toHaveBeenCalledWith(cli, "globals.json");
		expect(fs.readFileSync).toHaveBeenCalledWith("/abs/globals.json", "utf-8");
		expect(cli.addGlobals).toHaveBeenCalledWith(globals);
	});

	it("loads a JS/TS module and returns mod.default when it exists", async () => {
		const cli = makeCli();
		const globals = { env: "staging" };
		(resolveCliPath as Mock).mockReturnValue("/abs/globals.ts");
		(loadConfig as Mock).mockResolvedValue({ default: globals });

		await loadGlobals(cli, { globalsFile: "globals.ts" });

		expect(fs.readFileSync).not.toHaveBeenCalled();
		expect(loadConfig).toHaveBeenCalledWith("/abs/globals.ts");
		expect(cli.addGlobals).toHaveBeenCalledWith(globals);
	});

	it("returns mod directly when mod.default is undefined", async () => {
		const cli = makeCli();
		const globals = { env: "dev" };
		(resolveCliPath as Mock).mockReturnValue("/abs/globals.js");
		(loadConfig as Mock).mockResolvedValue(globals);

		await loadGlobals(cli, { globalsFile: "globals.js" });

		expect(cli.addGlobals).toHaveBeenCalledWith(globals);
	});

	it("does not call addGlobals when globalsFile is not provided", async () => {
		const cli = makeCli();

		await loadGlobals(cli, {});

		expect(cli.addGlobals).not.toHaveBeenCalled();
	});
});

describe("loadGlobals — inlineGlobals", () => {
	it("parses key=value pairs and calls cli.addGlobals", async () => {
		const cli = makeCli();

		await loadGlobals(cli, { inlineGlobals: ["name=alice", "env=prod"] });

		expect(cli.addGlobals).toHaveBeenCalledWith({ name: "alice", env: "prod" });
	});

	it("ignores entries without '='", async () => {
		const cli = makeCli();

		await loadGlobals(cli, { inlineGlobals: ["noequal", "key=val"] });

		expect(cli.addGlobals).toHaveBeenCalledWith({ key: "val" });
	});

	it("splits only on the first '=' when value contains '='", async () => {
		const cli = makeCli();

		await loadGlobals(cli, { inlineGlobals: ["url=http://x.com?a=1&b=2"] });

		expect(cli.addGlobals).toHaveBeenCalledWith({
			url: "http://x.com?a=1&b=2",
		});
	});

	it("does not call addGlobals when inlineGlobals is empty", async () => {
		const cli = makeCli();

		await loadGlobals(cli, { inlineGlobals: [] });

		expect(cli.addGlobals).not.toHaveBeenCalled();
	});
});

describe("loadGlobals — combined", () => {
	it("applies both globalsFile and inlineGlobals when both are provided", async () => {
		const cli = makeCli();
		(resolveCliPath as Mock).mockReturnValue("/abs/globals.json");
		(fs.readFileSync as Mock).mockReturnValue(JSON.stringify({ env: "prod" }));

		await loadGlobals(cli, {
			globalsFile: "globals.json",
			inlineGlobals: ["user=bob"],
		});

		expect(cli.addGlobals).toHaveBeenCalledTimes(2);
		expect(cli.addGlobals).toHaveBeenCalledWith({ env: "prod" });
		expect(cli.addGlobals).toHaveBeenCalledWith({ user: "bob" });
	});
});
