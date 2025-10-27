import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import type { FlowsConfig } from "~/models";
import { formatArgs } from "../formatArgs";
import { findWorkflow } from "./findWorkflow";
import { runFlow } from "./runFlow";

vi.mock("./findWorkflow", () => ({ findWorkflow: vi.fn() }));
vi.mock("../formatArgs", () => ({ formatArgs: vi.fn() }));

const makeCli = (): Cli =>
	({
		getProcessTerm: () => ({ cwd: () => "/cwd" }),
	}) as unknown as Cli;

const makeFlowsConfig = (
	constructors: Record<string, { constrFn: any; configKey?: string }> = {},
): FlowsConfig =>
	({
		workflows: { myWorkflow: {} },
		constructors,
	}) as unknown as FlowsConfig;

const makeConstrFn = (returnValue: unknown = undefined) =>
	vi.fn().mockResolvedValue(returnValue);

beforeEach(() => {
	vi.resetAllMocks();
	(formatArgs as Mock).mockReturnValue({});
	(findWorkflow as Mock).mockResolvedValue({});
});

describe("runFlow", () => {
	it("returns true when all steps succeed", async () => {
		const constrFn = makeConstrFn();
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "myCtor" },
		});

		const result = await runFlow({
			cli: makeCli(),
			args: ["myWorkflow"],
			flowsConfig: makeFlowsConfig({ myCtor: { constrFn } }),
		});

		expect(result).toBe(true);
		expect(constrFn).toHaveBeenCalled();
	});

	it("returns true even when workflow has no steps", async () => {
		const result = await runFlow({
			cli: makeCli(),
			args: ["myWorkflow"],
			flowsConfig: makeFlowsConfig(),
		});

		expect(result).toBe(true);
	});

	it("throws when constructor key is not found in flowsConfig", async () => {
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "missing" },
		});

		await expect(
			runFlow({
				cli: makeCli(),
				args: ["myWorkflow"],
				flowsConfig: makeFlowsConfig(),
			}),
		).rejects.toThrow('Constructor "missing" not found in flowsConfig.');
	});

	it("recursively runs steps returned by a constructor", async () => {
		const secondConstrFn = makeConstrFn();
		const cli = makeCli();
		const flowsConfig = makeFlowsConfig({
			firstCtor: {
				constrFn: vi.fn().mockImplementation((_key, _params, ctx) => ({
					steps: [{ ctorKey: "secondCtor" }],
					ctx,
				})),
			},
			secondCtor: { constrFn: secondConstrFn },
		});
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "firstCtor" },
		});

		const result = await runFlow({ cli, args: ["myWorkflow"], flowsConfig });

		expect(result).toBe(true);
		expect(secondConstrFn).toHaveBeenCalled();
	});

	it("executes multiple steps in sequence", async () => {
		const order: string[] = [];
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "first" },
			step2: { ctorKey: "second" },
		});

		await runFlow({
			cli: makeCli(),
			args: ["myWorkflow"],
			flowsConfig: makeFlowsConfig({
				first: {
					constrFn: vi.fn().mockImplementation(async () => {
						order.push("first");
					}),
				},
				second: {
					constrFn: vi.fn().mockImplementation(async () => {
						order.push("second");
					}),
				},
			}),
		});

		expect(order).toEqual(["first", "second"]);
	});

	it("passes correct context to constructor", async () => {
		const constrFn = makeConstrFn();
		const cli = makeCli();
		const formattedArgs = { name: "test" };
		(formatArgs as Mock).mockReturnValue(formattedArgs);
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "myCtor", key: "val" },
		});
		const flowsConfig = makeFlowsConfig({ myCtor: { constrFn } });

		await runFlow({
			cli,
			args: ["myWorkflow", { name: "test" }],
			flowsConfig,
			force: true,
			dest: "/my-dest",
			nameSpace: "ns/",
			filters: { k: "v" },
		});

		expect(constrFn).toHaveBeenCalledWith(
			"",
			{ key: "val" },
			expect.objectContaining({
				cli,
				args: formattedArgs,
				force: true,
				dest: "/my-dest",
				nameSpace: "ns/",
				filters: { k: "v" },
				flowsConfig,
			}),
		);
	});

	it("uses processTerm.cwd() as dest when dest is not provided", async () => {
		const constrFn = makeConstrFn();
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "myCtor" },
		});

		await runFlow({
			cli: makeCli(),
			args: ["myWorkflow"],
			flowsConfig: makeFlowsConfig({ myCtor: { constrFn } }),
		});

		expect(constrFn).toHaveBeenCalledWith(
			"",
			{},
			expect.objectContaining({ dest: "/cwd" }),
		);
	});

	it("passes configKey to constrFn when set on constructor", async () => {
		const constrFn = makeConstrFn();
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "myCtor" },
		});

		await runFlow({
			cli: makeCli(),
			args: ["myWorkflow"],
			flowsConfig: makeFlowsConfig({
				myCtor: { constrFn, configKey: "my-key" },
			}),
		});

		expect(constrFn).toHaveBeenCalledWith("my-key", {}, expect.anything());
	});

	it("passes empty object when step has no extra params", async () => {
		const constrFn = makeConstrFn();
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "myCtor" },
		});

		await runFlow({
			cli: makeCli(),
			args: ["myWorkflow"],
			flowsConfig: makeFlowsConfig({ myCtor: { constrFn } }),
		});

		expect(constrFn).toHaveBeenCalledWith("", {}, expect.anything());
	});

	it("calls formatArgs with the spread args after workflowName", async () => {
		(findWorkflow as Mock).mockResolvedValue({
			step1: { ctorKey: "myCtor" },
		});

		await runFlow({
			cli: makeCli(),
			args: ["myWorkflow", "extra-arg"],
			flowsConfig: makeFlowsConfig({ myCtor: { constrFn: makeConstrFn() } }),
		});

		expect(formatArgs).toHaveBeenCalledWith(["extra-arg"]);
	});

	it("calls findWorkflow with workflows, workflowName, and processTerm", async () => {
		const flowsConfig = makeFlowsConfig();

		await runFlow({
			cli: makeCli(),
			args: ["myWorkflow"],
			flowsConfig,
		});

		expect(findWorkflow).toHaveBeenCalledWith({
			workflows: flowsConfig.workflows,
			workflowName: "myWorkflow",
			cli: expect.objectContaining({ getProcessTerm: expect.any(Function) }),
		});
	});
});
