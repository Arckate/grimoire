import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import { resolveCliPath } from "~/path";
import { loadConfig } from "../utils/loadConfig";
import { loadPatches } from "./loadPatches";

vi.mock("node:fs", () => ({ readFileSync: vi.fn() }));
vi.mock("~/path/resolveCliPath", () => ({ resolveCliPath: vi.fn() }));
vi.mock("../utils/loadConfig", () => ({ loadConfig: vi.fn() }));

const cli = {} as Cli;

beforeEach(() => {
	vi.resetAllMocks();
});

describe("loadPatches", () => {
	it("reads and parses a JSON file when absPath has .json extension", async () => {
		const patches = {
			"fix.patch": { op: "replace", path: "/name", value: "x" },
		};
		(resolveCliPath as Mock).mockReturnValue("/abs/patches.json");
		(readFileSync as Mock).mockReturnValue(JSON.stringify(patches));

		const result = await loadPatches(cli, "patches.json");

		expect(resolveCliPath).toHaveBeenCalledWith(cli, "patches.json");
		expect(readFileSync).toHaveBeenCalledWith("/abs/patches.json", "utf-8");
		expect(result).toEqual(patches);
	});

	it("loads a JS/TS module and returns mod.default when it exists", async () => {
		const patches = {
			"fix.patch": { op: "replace", path: "/name", value: "x" },
		};
		(resolveCliPath as Mock).mockReturnValue("/abs/patches.ts");
		(loadConfig as Mock).mockResolvedValue({ default: patches });

		const result = await loadPatches(cli, "patches.ts");

		expect(readFileSync).not.toHaveBeenCalled();
		expect(loadConfig).toHaveBeenCalledWith("/abs/patches.ts");
		expect(result).toEqual(patches);
	});

	it("returns mod directly when mod.default is undefined", async () => {
		const patches = {
			"fix.patch": { op: "replace", path: "/name", value: "x" },
		};
		(resolveCliPath as Mock).mockReturnValue("/abs/patches.js");
		(loadConfig as Mock).mockResolvedValue(patches);

		const result = await loadPatches(cli, "patches.js");

		expect(result).toEqual(patches);
	});

	it("does not call loadConfig for JSON files", async () => {
		(resolveCliPath as Mock).mockReturnValue("/abs/patches.json");
		(readFileSync as Mock).mockReturnValue("{}");

		await loadPatches(cli, "patches.json");

		expect(loadConfig).not.toHaveBeenCalled();
	});
});
