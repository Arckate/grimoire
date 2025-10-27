import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import type { Generators, Plan } from "~/models";
import { FilePlanError } from "~/errors";
import { pathConstructor } from "~/path";
import { readPlan } from "~/utils";
import { applyPlanPatches } from "./applyPlanPatches";
import { runPlan } from "./runPlan";
import { sanitizePlan } from "./sanitizePlan";
import { separateArgsAndPlan } from "./separateArgsAndPlan";

vi.mock("~/utils/readPlan", () => ({ readPlan: vi.fn() }));
vi.mock("./sanitizePlan", () => ({ sanitizePlan: vi.fn() }));
vi.mock("./separateArgsAndPlan", () => ({ separateArgsAndPlan: vi.fn() }));
vi.mock("./applyPlanPatches", () => ({ applyPlanPatches: vi.fn() }));
vi.mock("~/path/pathConstructor", () => ({ pathConstructor: vi.fn() }));

const makeCli = (cwd = "/cwd"): Cli =>
	({
		getProcessTerm: () => ({ cwd: () => cwd }),
	}) as unknown as Cli;

const makeGenerators = (): Generators => ({}) as Generators;

const basePlan: Plan = {
	genName: "my-generator",
	genId: "123",
	genMeta: {},
};

const defaultSeparated = {
	genName: "my-generator",
	genDest: "./output",
	argsList: [],
	args: { key: "val" },
	planName: "my-plan",
};

beforeEach(() => {
	vi.resetAllMocks();
	(sanitizePlan as Mock).mockReturnValue({
		isPlan: true,
		isArrays: false,
		args: basePlan,
	});
	(separateArgsAndPlan as Mock).mockReturnValue(defaultSeparated);
	(pathConstructor as Mock).mockResolvedValue("/resolved/output");
});

describe("runPlan", () => {
	it("reads plan from file when args is a string", async () => {
		const cli = makeCli();
		(readPlan as Mock).mockReturnValue({ ...basePlan, planName: "from-file" });

		await runPlan({
			args: "/path/to/my.plan.json",
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
		});

		expect(readPlan).toHaveBeenCalledWith(cli, "/path/to/my.plan.json", null);
	});

	it("derives currentFileName from path basename when readPlan result has no planName", async () => {
		const cli = makeCli();
		(readPlan as Mock).mockReturnValue({ ...basePlan });

		await runPlan({
			args: "/path/to/my-app.plan.json",
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
		});

		expect(sanitizePlan).toHaveBeenCalledWith(
			expect.objectContaining({ planName: "my-app.plan" }),
		);
	});

	it("uses Plan object directly when args is not a string", async () => {
		const cli = makeCli();
		const planArg: Plan = { ...basePlan, planName: "direct-plan" };

		await runPlan({
			args: planArg,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
		});

		expect(readPlan).not.toHaveBeenCalled();
		expect(sanitizePlan).toHaveBeenCalledWith(planArg);
	});

	it("assigns oldPlanName as planName when args is a Plan without planName", async () => {
		const cli = makeCli();
		const planArg: Plan = { ...basePlan };

		await runPlan({
			args: planArg,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
			oldPlanName: "old-name",
		});

		expect(sanitizePlan).toHaveBeenCalledWith(
			expect.objectContaining({ planName: "old-name" }),
		);
	});

	it("throws FilePlanError when isPlan is false", async () => {
		const cli = makeCli();
		(sanitizePlan as Mock).mockReturnValue({
			isPlan: false,
			isArrays: false,
			args: basePlan,
		});

		await expect(
			runPlan({
				args: basePlan,
				cli,
				generators: makeGenerators(),
				parentConfig: null,
				genFn: vi.fn(),
			}),
		).rejects.toThrow(FilePlanError);
	});

	it("throws FilePlanError when isArrays is true", async () => {
		const cli = makeCli();
		(sanitizePlan as Mock).mockReturnValue({
			isPlan: true,
			isArrays: true,
			args: basePlan,
		});

		await expect(
			runPlan({
				args: basePlan,
				cli,
				generators: makeGenerators(),
				parentConfig: null,
				genFn: vi.fn(),
			}),
		).rejects.toThrow(FilePlanError);
	});

	it("applies patches when patches is non-empty", async () => {
		const cli = makeCli();
		const patches = {
			"some.patch": {
				selector: { genName: "my-generator" },
				value: { genName: "patched" },
			},
		};
		const patched = { ...basePlan, genName: "patched" };
		(applyPlanPatches as Mock).mockReturnValue(patched);

		await runPlan({
			args: basePlan,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
			patches,
		});

		expect(applyPlanPatches).toHaveBeenCalledWith(basePlan, patches);
		expect(separateArgsAndPlan).toHaveBeenCalledWith(patched, false, false);
	});

	it("skips applyPlanPatches when patches is empty", async () => {
		const cli = makeCli();

		await runPlan({
			args: basePlan,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
			patches: {},
		});

		expect(applyPlanPatches).not.toHaveBeenCalled();
	});

	it("skips applyPlanPatches when patches is undefined", async () => {
		const cli = makeCli();

		await runPlan({
			args: basePlan,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
		});

		expect(applyPlanPatches).not.toHaveBeenCalled();
	});

	it("calls pathConstructor with genDest and provided oldDest", async () => {
		const cli = makeCli();

		await runPlan({
			args: basePlan,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
			oldDest: "/old-dest",
		});

		expect(pathConstructor).toHaveBeenCalledWith(cli, "./output", "/old-dest");
	});

	it("uses processTerm.cwd() as oldDest when oldDest is not provided", async () => {
		const cli = makeCli("/cwd");

		await runPlan({
			args: basePlan,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
		});

		expect(pathConstructor).toHaveBeenCalledWith(cli, "./output", "/cwd");
	});

	it("calls genFn with correct params", async () => {
		const cli = makeCli();
		const generators = makeGenerators();
		const genFn = vi.fn().mockResolvedValue(undefined);

		await runPlan({
			args: basePlan,
			cli,
			generators,
			parentConfig: null,
			genFn,
			force: true,
			deep: true,
		});

		expect(genFn).toHaveBeenCalledWith({
			dest: "/resolved/output",
			planName: "my-plan",
			args: ["my-generator", { key: "val" }],
			generators,
			cli,
			force: true,
		});
	});

	it("passes deep and ignoreDest to separateArgsAndPlan", async () => {
		const cli = makeCli();

		await runPlan({
			args: basePlan,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
			deep: true,
			ignoreDest: true,
		});

		expect(separateArgsAndPlan).toHaveBeenCalledWith(basePlan, true, true);
	});

	it("returns argsList, dest, and planName", async () => {
		const cli = makeCli();
		(separateArgsAndPlan as Mock).mockReturnValue({
			...defaultSeparated,
			argsList: ["child-plan"],
			planName: "returned-plan",
		});

		const result = await runPlan({
			args: basePlan,
			cli,
			generators: makeGenerators(),
			parentConfig: null,
			genFn: vi.fn().mockResolvedValue(undefined),
		});

		expect(result.argsList).toEqual(["child-plan"]);
		expect(result.dest).toBe("/resolved/output");
		expect(result.planName).toBe("returned-plan");
	});
});
