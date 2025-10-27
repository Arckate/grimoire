import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import { findAllPlanFile } from "./findAllPlanFile";
import { findParentConfig } from "./findParentConfig";
import { isPlanFile } from "./isPlanFile";

vi.mock("node:fs/promises");
vi.mock("./findParentConfig", () => ({ findParentConfig: vi.fn() }));
vi.mock("./isPlanFile", () => ({ isPlanFile: vi.fn() }));

const cli = {} as Cli;

beforeEach(() => {
	vi.resetAllMocks();
	(findParentConfig as Mock).mockReturnValue(null);
	(isPlanFile as Mock).mockImplementation((_cli, name: string) =>
		name.endsWith(".plan.json"),
	);
});

describe("findAllPlanFile", () => {
	it("returns only .plan.json files", async () => {
		(fs.readdir as Mock).mockResolvedValue([
			{ name: "data.plan.json", isDirectory: () => false },
			{ name: "other.json", isDirectory: () => false },
			{ name: "folder", isDirectory: () => true },
			{ name: "config.plan.json", isDirectory: () => false },
		]);

		const result = await findAllPlanFile(cli, "/some/path");

		expect(result).toEqual(["data.plan.json", "config.plan.json"]);
	});

	it("returns empty array when no .plan.json files are found", async () => {
		(fs.readdir as Mock).mockResolvedValue([
			{ name: "data.json", isDirectory: () => false },
			{ name: "folder", isDirectory: () => true },
			{ name: "notes.txt", isDirectory: () => false },
		]);

		const result = await findAllPlanFile(cli, "/some/path");

		expect(result).toEqual([]);
	});

	it("returns empty array when directory is empty", async () => {
		(fs.readdir as Mock).mockResolvedValue([]);

		const result = await findAllPlanFile(cli, "/empty");

		expect(result).toEqual([]);
	});

	it("passes cli and parentConfig to isPlanFile", async () => {
		const parentConfig = { planExt: "yaml" };
		(findParentConfig as Mock).mockReturnValue(parentConfig);
		(isPlanFile as Mock).mockReturnValue(true);
		(fs.readdir as Mock).mockResolvedValue([
			{ name: "data.plan.yaml", isDirectory: () => false },
		]);

		await findAllPlanFile(cli, "/some/path");

		expect(findParentConfig).toHaveBeenCalledWith(cli);
		expect(isPlanFile).toHaveBeenCalledWith(
			cli,
			"data.plan.yaml",
			parentConfig,
		);
	});

	it("calls readdir with withFileTypes option", async () => {
		(fs.readdir as Mock).mockResolvedValue([]);

		await findAllPlanFile(cli, "/some/path");

		expect(fs.readdir).toHaveBeenCalledWith("/some/path", {
			withFileTypes: true,
		});
	});
});
