import { describe, expect, it } from "vitest";
import type { Cli } from "~/Cli";
import { PLAN_EXT } from "~/const";
import { isPlanFile } from "./isPlanFile";

const makeCli = (planExt?: string): Cli =>
	({ getConfig: () => (planExt ? { planExt } : {}) }) as unknown as Cli;

describe("isPlanFile", () => {
	it("returns true for a file matching the default extension (.plan.json)", () => {
		const cli = makeCli();

		expect(isPlanFile(cli, "/some/path/data.plan.json", null)).toBe(true);
		expect(isPlanFile(cli, "data.plan.json", null)).toBe(true);
		expect(isPlanFile(cli, "./data.plan.json", null)).toBe(true);
	});

	it("returns false for a .json file that is not a plan file", () => {
		const cli = makeCli();

		expect(isPlanFile(cli, "/some/path/data.json", null)).toBe(false);
		expect(isPlanFile(cli, "data.config.json", null)).toBe(false);
		expect(isPlanFile(cli, "gen.data.json", null)).toBe(false);
	});

	it("returns false for non-json files", () => {
		const cli = makeCli();

		expect(isPlanFile(cli, "data.plan.js", null)).toBe(false);
		expect(isPlanFile(cli, "data.plan.txt", null)).toBe(false);
	});

	it("returns false for directory paths", () => {
		const cli = makeCli();

		expect(isPlanFile(cli, "/some/path/gen.json/", null)).toBe(false);
	});

	it(`uses default PLAN_EXT (${PLAN_EXT}) when cli config and parentConfig have no planExt`, () => {
		const cli = makeCli();

		expect(isPlanFile(cli, `file.plan.${PLAN_EXT}`, null)).toBe(true);
	});

	it("uses planExt from parentConfig when provided", () => {
		const cli = makeCli();

		expect(isPlanFile(cli, "file.plan.yaml", { planExt: "yaml" })).toBe(true);
		expect(isPlanFile(cli, "file.plan.json", { planExt: "yaml" })).toBe(false);
	});

	it("uses planExt from cli config when parentConfig has none", () => {
		const cli = makeCli("toml");

		expect(isPlanFile(cli, "file.plan.toml", null)).toBe(true);
		expect(isPlanFile(cli, "file.plan.json", null)).toBe(false);
	});

	it("parentConfig planExt takes priority over cli config planExt", () => {
		const cli = makeCli("toml");

		expect(isPlanFile(cli, "file.plan.yaml", { planExt: "yaml" })).toBe(true);
		expect(isPlanFile(cli, "file.plan.toml", { planExt: "yaml" })).toBe(false);
	});
});
