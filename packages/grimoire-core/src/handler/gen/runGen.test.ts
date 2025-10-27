import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import type { Cli } from "~/Cli";
import type { IResult } from "~/engine";
import { Engine } from "~/engine";
import type { Generators } from "~/models";
import { resultPrompt, searchGeneratorPrompt } from "~/prompts";
import { formatArgs } from "../formatArgs";
import { runGen } from "./runGen";

vi.mock("~/engine", () => ({ Engine: { init: vi.fn() } }));
vi.mock("~/prompts/searchGeneratorPrompt", () => ({
	searchGeneratorPrompt: vi.fn(),
}));
vi.mock("~/prompts/resultPrompt", () => ({ resultPrompt: vi.fn() }));
vi.mock("../formatArgs", () => ({ formatArgs: vi.fn() }));

const makeCli = (): Cli =>
	({
		getProcessTerm: () => ({}),
		getDataEngine: () => ({}),
		getPrompts: () => ({ cliSearchGenerator: searchGeneratorPrompt, cliResult: resultPrompt }),
	}) as unknown as Cli;

const makeGenerators = (): Generators =>
	({ "gen-a": vi.fn() }) as unknown as Generators;

const makeEngine = () => ({
	setGenerators: vi.fn(),
	getGeneratorList: vi.fn().mockReturnValue(["gen-a"]),
	getGenerator: vi.fn(),
});

const makeIResult = (
	status: "OK" | "KO",
	data: any = {},
	errorMessage = "error",
): IResult<any> => {
	const self: any = {
		GetResult: () =>
			status === "OK"
				? { status: "OK" as const, where: "mock", data }
				: { status: "KO" as const, where: "mock", error: { message: errorMessage } },
		Match: (success: any, fail: any) =>
			status === "OK" ? success(data) : fail({ message: errorMessage }),
		Then: (fn: any) => (status === "OK" ? fn(data) : self),
		ThenAsync: (fn: any) =>
			status === "OK" ? fn(data) : Promise.resolve(self),
	};
	return self;
};

const makeGenerator = (
	promptStatus: "OK" | "KO" = "OK",
	actionStatus: "OK" | "KO" = "OK",
	actionData: unknown = [],
	errorMessage = "failed",
) => ({
	runPrompts: vi.fn().mockResolvedValue(makeIResult(promptStatus, {}, errorMessage)),
	runActions: vi.fn().mockResolvedValue(makeIResult(actionStatus, actionData, errorMessage)),
});

beforeEach(() => {
	vi.resetAllMocks();
	(formatArgs as Mock).mockReturnValue({});
	(searchGeneratorPrompt as Mock).mockResolvedValue("gen-a");
});

describe("runGen", () => {
	it("returns true on success", async () => {
		const engine = makeEngine();
		const generators = makeGenerators();
		(Engine.init as Mock).mockReturnValue(engine);
		engine.getGenerator.mockReturnValue(makeGenerator());

		const result = await runGen({ args: ["gen-a"], cli: makeCli(), generators });

		expect(result).toBe(true);
		expect(engine.setGenerators).toHaveBeenCalledWith(generators);
	});

	it("calls searchGeneratorPrompt with isValidGenerator: false when genName is empty", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		engine.getGenerator.mockReturnValue(makeGenerator());

		await runGen({ args: [""], cli: makeCli(), generators: makeGenerators() });

		expect(searchGeneratorPrompt).toHaveBeenCalledWith(
			expect.objectContaining({ config: expect.objectContaining({ isValid: false }), defaultValue: "" }),
		);
	});

	it("calls searchGeneratorPrompt with isValidGenerator: false when genName is not in list", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		engine.getGenerator.mockReturnValue(makeGenerator());

		await runGen({ args: ["unknown-gen"], cli: makeCli(), generators: makeGenerators() });

		expect(searchGeneratorPrompt).toHaveBeenCalledWith(
			expect.objectContaining({ config: expect.objectContaining({ isValid: false }), defaultValue: "unknown-gen" }),
		);
	});

	it("calls searchGeneratorPrompt with isValidGenerator: true when genName is in list", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		engine.getGenerator.mockReturnValue(makeGenerator());

		await runGen({ args: ["gen-a"], cli: makeCli(), generators: makeGenerators() });

		expect(searchGeneratorPrompt).toHaveBeenCalledWith(
			expect.objectContaining({ config: expect.objectContaining({ isValid: true }), defaultValue: "gen-a" }),
		);
	});

	it("returns false and does not call runActions when promptResult is KO", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		const generator = makeGenerator("KO");
		engine.getGenerator.mockReturnValue(generator);

		const result = await runGen({ args: ["gen-a"], cli: makeCli(), generators: makeGenerators() });

		expect(result).toBe(false);
		expect(generator.runActions).not.toHaveBeenCalled();
	});

	it("returns false when actionResult is KO", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		engine.getGenerator.mockReturnValue(makeGenerator("OK", "KO"));

		const result = await runGen({ args: ["gen-a"], cli: makeCli(), generators: makeGenerators() });

		expect(result).toBe(false);
	});

	it("calls resultPrompt with items mapped from action results", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		const actionItems = [
			makeIResult("OK", { type: "create", name: "file.ts", value: "file.ts" }),
			makeIResult("KO", {}, "partial fail"),
		];
		engine.getGenerator.mockReturnValue(makeGenerator("OK", "OK", actionItems));

		await runGen({ args: ["gen-a"], cli: makeCli(), generators: makeGenerators() });

		expect(resultPrompt).toHaveBeenCalledWith(
			expect.objectContaining({
				config: expect.objectContaining({
					items: [
						{ isValid: true, data: { type: "create", name: "file.ts", value: "file.ts" } },
						{ isValid: false, data: { message: "partial fail" } },
					],
				}),
			}),
		);
	});

	it("resultPrompt item uses data.name when value is undefined", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		const actionItems = [makeIResult("OK", { type: "create", name: "MyClass" })];
		engine.getGenerator.mockReturnValue(makeGenerator("OK", "OK", actionItems));

		await runGen({ args: ["gen-a"], cli: makeCli(), generators: makeGenerators() });

		expect(resultPrompt).toHaveBeenCalledWith(
			expect.objectContaining({
				config: expect.objectContaining({
					items: [{ isValid: true, data: { type: "create", name: "MyClass" } }],
				}),
			}),
		);
	});

	it("calls resultPrompt with empty items when result data is not an array", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		engine.getGenerator.mockReturnValue(makeGenerator("OK", "OK", "not-array"));

		const result = await runGen({ args: ["gen-a"], cli: makeCli(), generators: makeGenerators() });

		expect(result).toBe(true);
		expect(resultPrompt).toHaveBeenCalledWith(expect.objectContaining({ config: expect.objectContaining({ items: [] }) }));
	});

	it("calls resultPrompt with a KO item when promptResult is KO", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		engine.getGenerator.mockReturnValue(makeGenerator("KO", "OK", [], "prompt failed"));

		await runGen({ args: ["gen-a"], cli: makeCli(), generators: makeGenerators() });

		expect(resultPrompt).toHaveBeenCalledWith(
			expect.objectContaining({
				config: expect.objectContaining({
					items: [{ isValid: false, data: { message: "prompt failed" } }],
				}),
			}),
		);
	});

	it("passes force flag to Engine.init", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		engine.getGenerator.mockReturnValue(makeGenerator());

		await runGen({ args: ["gen-a"], cli: makeCli(), generators: makeGenerators(), force: true });

		expect(Engine.init).toHaveBeenCalledWith(expect.objectContaining({ force: true }));
	});

	it("passes bypass from formatArgs to generator.runPrompts", async () => {
		const engine = makeEngine();
		(Engine.init as Mock).mockReturnValue(engine);
		const bypass = { name: "my-project" };
		(formatArgs as Mock).mockReturnValue(bypass);
		const generator = makeGenerator();
		engine.getGenerator.mockReturnValue(generator);

		await runGen({
			args: ["gen-a", { name: "my-project" }] as unknown as [
				string,
				Record<string, string>,
			],
			cli: makeCli(),
			generators: makeGenerators(),
		});

		expect(generator.runPrompts).toHaveBeenCalledWith(expect.anything(), {}, bypass);
	});
});
