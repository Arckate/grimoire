import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { Action } from "~/actions";
import { Results } from "~/engine";
import { GeneratorError } from "~/errors";
import { Prompt } from "~/prompts";
import { Generator } from "./Generator";

vi.mock("~/actions/Action", () => ({ Action: { init: vi.fn() } }));
vi.mock("~/prompts/Prompt", () => ({ Prompt: { init: vi.fn() } }));
vi.mock("~/engine/Results/Results", () => ({
	Results: { returnError: vi.fn() },
}));

const makePrompt = () => ({
	run: vi.fn().mockResolvedValue(undefined),
	getData: vi.fn().mockReturnValue({ status: "OK", data: {} }),
});

const makeAction = () => ({
	run: vi.fn().mockResolvedValue({ status: "OK", data: [] }),
});

const makeParams = (generatorOverrides: Record<string, unknown> = {}) => ({
	processTerm: {} as any,
	data: { custom: {}, answer: {} } as any,
	prompts: {} as any,
	actions: {} as any,
	tools: {} as any,
	generator: generatorOverrides as any,
});

beforeEach(() => {
	vi.resetAllMocks();
});

describe("Generator.init", () => {
	it("returns a Generator instance when params are valid", () => {
		const gen = Generator.init(makeParams());
		expect(gen).toBeInstanceOf(Generator);
	});

	it("throws GeneratorError with string when constructor throws a string", () => {
		const throwing = new Proxy(
			{},
			{
				get() {
					throw "string error";
				},
			},
		);
		expect(() => Generator.init(throwing as any)).toThrow(GeneratorError);
		expect(() => Generator.init(throwing as any)).toThrow("string error");
	});

	it("throws GeneratorError with message when constructor throws an Error", () => {
		expect(() => Generator.init(null as any)).toThrow(GeneratorError);
	});

	it("throws GeneratorError with 'internal error' for non-string non-Error throws", () => {
		const throwing = new Proxy(
			{},
			{
				get() {
					throw 42;
				},
			},
		);
		expect(() => Generator.init(throwing as any)).toThrow("internal error");
	});
});

describe("Generator.runPrompts", () => {
	it("calls prompt.run(prompts) when generator.prompts is not a function", async () => {
		const mockPrompt = makePrompt();
		(Prompt.init as Mock).mockReturnValue(mockPrompt);
		const promptsConfig = [{ type: "input", name: "q" }];
		const gen = Generator.init(makeParams({ prompts: promptsConfig }));

		await gen.runPrompts({} as any, {}, {});

		expect(mockPrompt.run).toHaveBeenCalledWith(promptsConfig);
	});

	it("calls prompts(prompt) when generator.prompts is a function", async () => {
		const mockPrompt = makePrompt();
		(Prompt.init as Mock).mockReturnValue(mockPrompt);
		const promptsFn = vi.fn().mockResolvedValue(undefined);
		const gen = Generator.init(makeParams({ prompts: promptsFn }));

		await gen.runPrompts({} as any, {}, {});

		expect(promptsFn).toHaveBeenCalledWith(mockPrompt);
		expect(mockPrompt.run).not.toHaveBeenCalled();
	});

	it("returns prompt.getData() result", async () => {
		const mockPrompt = makePrompt();
		const fakeResult = { status: "OK", data: { name: "test" } };
		mockPrompt.getData.mockReturnValue(fakeResult);
		(Prompt.init as Mock).mockReturnValue(mockPrompt);
		const gen = Generator.init(makeParams({ prompts: [] }));

		const result = await gen.runPrompts({} as any, {}, {});

		expect(result).toBe(fakeResult);
	});

	it("merges customData into data.custom", async () => {
		const mockPrompt = makePrompt();
		(Prompt.init as Mock).mockReturnValue(mockPrompt);
		const gen = Generator.init(makeParams({ prompts: [] }));

		await gen.runPrompts({} as any, { extra: "value" }, {});

		expect(Prompt.init).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ custom: { extra: "value" } }),
			}),
		);
	});

	it("passes processTerm argument to Prompt.init", async () => {
		const mockPrompt = makePrompt();
		(Prompt.init as Mock).mockReturnValue(mockPrompt);
		const customPt = { cwd: () => "/custom" } as any;
		const gen = Generator.init(makeParams({ prompts: [] }));

		await gen.runPrompts(customPt, {}, {});

		expect(Prompt.init).toHaveBeenCalledWith(
			expect.objectContaining({ processTerm: customPt }),
		);
	});

	it("falls back to this.processTerm when processTerm argument is falsy", async () => {
		const mockPrompt = makePrompt();
		(Prompt.init as Mock).mockReturnValue(mockPrompt);
		const instancePt = { cwd: () => "/instance" } as any;
		const params = { ...makeParams({ prompts: [] }), processTerm: instancePt };
		const gen = Generator.init(params);

		await gen.runPrompts(null as any, {}, {});

		expect(Prompt.init).toHaveBeenCalledWith(
			expect.objectContaining({ processTerm: instancePt }),
		);
	});

	it("returns Results.returnError when prompts throws", async () => {
		const errorResult = { status: "KO", error: new Error("fail") };
		(Results.returnError as Mock).mockReturnValue(errorResult);
		(Prompt.init as Mock).mockImplementation(() => {
			throw new Error("prompt crash");
		});
		const gen = Generator.init(makeParams({ prompts: [] }));

		const result = await gen.runPrompts({} as any, {}, {});

		expect(Results.returnError).toHaveBeenCalled();
		expect(result).toBe(errorResult);
	});
});

describe("Generator.runActions", () => {
	it("calls action.run(actions) when generator.actions is not a function", async () => {
		const mockAction = makeAction();
		(Action.init as Mock).mockReturnValue(mockAction);
		const actionsConfig = { create: {} };
		const gen = Generator.init(makeParams({ actions: actionsConfig }));

		await gen.runActions({});

		expect(mockAction.run).toHaveBeenCalledWith(actionsConfig);
	});

	it("calls actions(action) when generator.actions is a function", async () => {
		const mockAction = makeAction();
		(Action.init as Mock).mockReturnValue(mockAction);
		const actionsFn = vi.fn().mockResolvedValue({ status: "OK", data: [] });
		const gen = Generator.init(makeParams({ actions: actionsFn }));

		await gen.runActions({});

		expect(actionsFn).toHaveBeenCalledWith(mockAction);
		expect(mockAction.run).not.toHaveBeenCalled();
	});

	it("assigns answer to data.answer", async () => {
		const mockAction = makeAction();
		(Action.init as Mock).mockReturnValue(mockAction);
		const gen = Generator.init(makeParams({ actions: [] }));
		const answer = { name: "Alice" };

		await gen.runActions(answer);

		expect(Action.init).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ answer }),
			}),
		);
	});

	it("merges customData into data.custom", async () => {
		const mockAction = makeAction();
		(Action.init as Mock).mockReturnValue(mockAction);
		const gen = Generator.init(makeParams({ actions: [] }));

		await gen.runActions({}, { env: "prod" });

		expect(Action.init).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ custom: { env: "prod" } }),
			}),
		);
	});

	it("returns Results.returnError when actions throws", async () => {
		const errorResult = { status: "KO", error: new Error("fail") };
		(Results.returnError as Mock).mockReturnValue(errorResult);
		(Action.init as Mock).mockImplementation(() => {
			throw new Error("action crash");
		});
		const gen = Generator.init(makeParams({ actions: [] }));

		const result = await gen.runActions({});

		expect(Results.returnError).toHaveBeenCalled();
		expect(result).toBe(errorResult);
	});

	it("passes tools and actions to Action.init", async () => {
		const mockAction = makeAction();
		(Action.init as Mock).mockReturnValue(mockAction);
		const tools = { fs: { write: vi.fn() } };
		const actions = {} as any;
		const params = { ...makeParams({ actions }), tools };
		const gen = Generator.init(params);

		await gen.runActions({});

		expect(Action.init).toHaveBeenCalledWith(
			expect.objectContaining({ tools, actions }),
		);
	});
});
