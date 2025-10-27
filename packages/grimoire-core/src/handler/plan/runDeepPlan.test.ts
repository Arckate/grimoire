import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import { ROOTS } from "~/const";
import type { GeneratorsSubConfig, Plan } from "~/models";
import { findParentConfig, findRoots, isConfigFileInFolder } from "~/path";
import { findGenerators } from "../gen";
import { runDeepPlan } from "./runDeepPlan";
import { runPlan } from "./runPlan";

vi.mock("~/path/findRoots", () => ({ findRoots: vi.fn() }));
vi.mock("~/path/isConfigFileInFolder", () => ({
	isConfigFileInFolder: vi.fn(),
}));
vi.mock("~/path/findParentConfig", () => ({ findParentConfig: vi.fn() }));
vi.mock("~/prompts/logger", () => ({ logger: vi.fn(), logError: vi.fn() }));
vi.mock("../gen/findGenerators", () => ({ findGenerators: vi.fn() }));
vi.mock("./runPlan", () => ({ runPlan: vi.fn() }));

const makeCli = (): Cli =>
	({
		getProcessTerm: () => ({ cwd: () => "/cwd" }),
		getConfig: () => ({}),
		getDir: vi.fn(() => "/parent-dir"),
		setDirs: vi.fn(),
	}) as unknown as Cli;

const makeConfig = (): GeneratorsSubConfig => ({}) as GeneratorsSubConfig;

const basePlan: Plan = { genName: "gen", genId: "1", genMeta: {} };

beforeEach(() => {
	vi.resetAllMocks();
	(findRoots as Mock).mockReturnValue({ [ROOTS.PARENT]: "/parent" });
	(isConfigFileInFolder as Mock).mockReturnValue(false);
	(findParentConfig as Mock).mockReturnValue({});
	(findGenerators as Mock).mockResolvedValue({});
	(runPlan as Mock).mockResolvedValue({
		argsList: [],
		dest: "/child-dest",
		planName: "child-plan",
	});
});

describe("runDeepPlan", () => {
	it("returns true", async () => {
		const result = await runDeepPlan({
			cli: makeCli(),
			argsList: [],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
		});

		expect(result).toBe(true);
	});

	it("calls setDirs with initialParent on completion", async () => {
		const cli = makeCli();

		await runDeepPlan({
			cli,
			argsList: [],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			parent: "/initial-parent",
		});

		expect(cli.setDirs).toHaveBeenCalledWith({
			[ROOTS.PARENT]: "/initial-parent",
		});
	});

	it("does not call runPlan when argsList is empty", async () => {
		await runDeepPlan({
			cli: makeCli(),
			argsList: [],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
		});

		expect(runPlan).not.toHaveBeenCalled();
	});

	it("calls findGenerators with cli, config, and typeGen", async () => {
		const cli = makeCli();
		const config = makeConfig();

		await runDeepPlan({
			cli,
			argsList: [],
			generatorsConfig: config,
			genFn: vi.fn(),
			parentConfig: {},
			typeGen: "my-type",
		});

		expect(findGenerators).toHaveBeenCalledWith({
			cli,
			config,
			typeGen: "my-type",
		});
	});

	it("uses processTerm.cwd() as dest when dest is not provided", async () => {
		await runDeepPlan({
			cli: makeCli(),
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			parent: "/parent",
		});

		expect(runPlan).toHaveBeenCalledWith(
			expect.objectContaining({ oldDest: "/cwd" }),
		);
	});

	it("uses provided dest instead of cwd", async () => {
		await runDeepPlan({
			cli: makeCli(),
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			dest: "/custom-dest",
			parent: "/parent",
		});

		expect(runPlan).toHaveBeenCalledWith(
			expect.objectContaining({ oldDest: "/custom-dest" }),
		);
	});

	it("does not call findRoots when initialParent is provided", async () => {
		await runDeepPlan({
			cli: makeCli(),
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			parent: "/initial-parent",
		});

		expect(findRoots).not.toHaveBeenCalled();
	});

	it("calls findRoots when initialParent is not provided", async () => {
		await runDeepPlan({
			cli: makeCli(),
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
		});

		expect(findRoots).toHaveBeenCalledTimes(1);
	});

	it("calls runPlan with correct params", async () => {
		const cli = makeCli();
		const genFn = vi.fn();
		const config = makeConfig();
		const patches = {
			"my.patch": {
				selector: { genName: "gen" },
				value: { genName: "patched" },
			},
		};

		await runDeepPlan({
			cli,
			argsList: [basePlan],
			generatorsConfig: config,
			genFn,
			parentConfig: { foo: "bar" },
			dest: "/parent/sub",
			force: true,
			deep: true,
			ignoreDest: true,
			planName: "parent-plan",
			parent: "/parent",
			patches,
		});

		expect(runPlan).toHaveBeenCalledWith({
			args: basePlan,
			cli,
			generators: {},
			force: true,
			oldDest: "/parent/sub",
			ignoreDest: true,
			deep: true,
			oldPlanName: "parent-plan",
			parentConfig: { foo: "bar" },
			patches,
			genFn,
		});
	});

	it("calls findParentConfig and re-calls findGenerators when dest is outside parent scope", async () => {
		const cli = makeCli();
		(findParentConfig as Mock).mockReturnValue({});

		await runDeepPlan({
			cli,
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			dest: "/other-path",
			parent: "/parent",
		});

		expect(findParentConfig).toHaveBeenCalledWith(cli);
		expect(findGenerators).toHaveBeenCalledTimes(3); // initial + re-call + recursive
	});

	it("calls findParentConfig when isConfigFileInFolder returns true", async () => {
		const cli = makeCli();
		(isConfigFileInFolder as Mock).mockReturnValue(true);

		await runDeepPlan({
			cli,
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			dest: "/parent/sub",
			parent: "/parent",
		});

		expect(findParentConfig).toHaveBeenCalledWith(cli);
	});

	it("skips findParentConfig when generators has subGenConf", async () => {
		(findGenerators as Mock).mockResolvedValue({ subGenConf: true });

		await runDeepPlan({
			cli: makeCli(),
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			dest: "/other-path",
			parent: "/parent",
		});

		expect(findParentConfig).not.toHaveBeenCalled();
	});

	it("uses innerParentConfig.typeGen for re-call of findGenerators when set", async () => {
		(findParentConfig as Mock).mockReturnValue({ typeGen: "inner-type" });

		await runDeepPlan({
			cli: makeCli(),
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			dest: "/other-path",
			parent: "/parent",
		});

		expect(findGenerators).toHaveBeenCalledWith(
			expect.objectContaining({ typeGen: "inner-type" }),
		);
	});

	it("skips recursive call when argsList is emptied during runPlan execution", async () => {
		const argsList: Plan[] = [basePlan];
		(runPlan as Mock).mockImplementationOnce(async () => {
			argsList.length = 0;
			return { argsList: [], dest: "/child-dest", planName: "child-plan" };
		});

		await runDeepPlan({
			cli: makeCli(),
			argsList,
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			parent: "/parent",
			dest: "/parent/sub",
		});

		expect(runPlan).toHaveBeenCalledTimes(1);
		expect(findGenerators).toHaveBeenCalledTimes(1);
	});

	it("recursively calls runDeepPlan with childArgsList", async () => {
		const childPlan: Plan = { genName: "child", genId: "2", genMeta: {} };
		(runPlan as Mock)
			.mockResolvedValueOnce({
				argsList: [childPlan],
				dest: "/child-dest",
				planName: "child-plan",
			})
			.mockResolvedValue({
				argsList: [],
				dest: "/leaf-dest",
				planName: "leaf",
			});

		await runDeepPlan({
			cli: makeCli(),
			argsList: [basePlan],
			generatorsConfig: makeConfig(),
			genFn: vi.fn(),
			parentConfig: {},
			parent: "/parent",
		});

		expect(runPlan).toHaveBeenCalledTimes(2);
		expect(runPlan).toHaveBeenLastCalledWith(
			expect.objectContaining({ args: childPlan, oldDest: "/child-dest" }),
		);
	});
});
