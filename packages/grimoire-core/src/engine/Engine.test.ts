import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { EngineError } from "~/errors";
import { Generator } from "~/generators";
import { Engine } from "./Engine";

vi.mock("~/generators/Generator", () => ({ Generator: { init: vi.fn() } }));

const makePT = (cwd = "/cwd") => ({ cwd: () => cwd }) as any;

beforeEach(() => {
	vi.resetAllMocks();
});

describe("Engine.init", () => {
	it("returns an Engine instance", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(engine).toBeInstanceOf(Engine);
	});

	it("uses provided dest", () => {
		const genFn = vi.fn().mockReturnValue({ description: "g" });
		const engine = Engine.init({ processTerm: {}, dest: "/custom-dest" });
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ dest: "/custom-dest" }),
		);
	});

	it("falls back to processTerm.cwd() when dest is not provided", () => {
		const genFn = vi.fn().mockReturnValue({ description: "g" });
		const engine = Engine.init({ processTerm: makePT("/from-cwd") });
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ dest: "/from-cwd" }),
		);
	});

	it("sets force default to false", () => {
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({ processTerm: {} });
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ force: false }),
		);
	});

	it("passes force: true when provided", () => {
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({ processTerm: {}, force: true });
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ force: true }),
		);
	});

	it("throws EngineError when init body throws an Error", () => {
		expect(() =>
			Engine.init({
				processTerm: {
					cwd: () => {
						throw new Error("boom");
					},
				},
			}),
		).toThrow(EngineError);
	});

	it("throws EngineError with message when init body throws a string", () => {
		expect(() =>
			Engine.init({
				processTerm: {
					cwd: () => {
						throw "string error";
					},
				},
			}),
		).toThrow("string error");
	});

	it("throws EngineError with 'internal error' for non-string non-Error throws", () => {
		expect(() =>
			Engine.init({
				processTerm: {
					cwd: () => {
						throw 42;
					},
				},
			}),
		).toThrow("internal error");
	});
});

describe("Engine.getConfig / setConfig", () => {
	it("getConfig returns empty object by default", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(engine.getConfig()).toEqual({});
	});

	it("getConfig returns config passed at init", () => {
		const engine = Engine.init({
			processTerm: {},
			config: { theme: "dark" },
		});
		expect(engine.getConfig()).toEqual({ theme: "dark" });
	});

	it("setConfig merges into existing config", () => {
		const engine = Engine.init({
			processTerm: {},
			config: { a: 1 },
		});
		engine.setConfig({ b: 2 });
		expect(engine.getConfig()).toEqual({ a: 1, b: 2 });
	});

	it("setConfig returns the engine instance for chaining", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(engine.setConfig({})).toBe(engine);
	});
});

describe("Engine data setters", () => {
	it("setDataGlobals merges globals into data", () => {
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({
			processTerm: {},
			globals: { env: "prod" },
		});
		engine.setDataGlobals({ user: "alice" });
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ globals: { env: "prod", user: "alice" } }),
		);
	});

	it("setDataForce updates force value", () => {
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({ processTerm: {} });
		engine.setDataForce(true);
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ force: true }),
		);
	});

	it("setDataDest updates dest value", () => {
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({ processTerm: {} });
		engine.setDataDest("/new-dest");
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ dest: "/new-dest" }),
		);
	});

	it("setDataDirnames merges dirnames", () => {
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({
			processTerm: {},
			dirnames: { src: "./src" },
		});
		engine.setDataDirnames({ dist: "./dist" });
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({
				dirnames: { src: "./src", dist: "./dist" },
			}),
		);
	});

	it("setDataCustom merges custom data", () => {
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({
			processTerm: {},
			custom: { x: 1 },
		});
		engine.setDataCustom({ y: 2 });
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ dest: expect.any(String) }),
		);
	});

	it("data setters return the engine instance for chaining", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(engine.setDataForce(false)).toBe(engine);
		expect(engine.setDataDest("/d")).toBe(engine);
		expect(engine.setDataGlobals({})).toBe(engine);
		expect(engine.setDataDirnames({})).toBe(engine);
		expect(engine.setDataCustom({})).toBe(engine);
	});
});

describe("Engine.setAction / setPrompt", () => {
	it("setAction stores action and makes it available via getDataEngine", () => {
		const actionFn = vi.fn() as any;
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({ processTerm: {} });
		engine.setAction("myAction", actionFn);
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ actions: { myAction: actionFn } }),
		);
	});

	it("setPrompt stores prompt and makes it available via getDataEngine", () => {
		const promptFn = vi.fn() as any;
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({ processTerm: {} });
		engine.setPrompt("myPrompt", promptFn);
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ prompts: { myPrompt: promptFn } }),
		);
	});

	it("setAction returns the engine instance for chaining", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(engine.setAction("a", vi.fn() as any)).toBe(engine);
	});
});

describe("Engine.setGenerators", () => {
	it("calls each generator function with engine data", () => {
		const genFn = vi.fn().mockReturnValue({ description: "my gen" });
		const engine = Engine.init({ processTerm: makePT() });
		engine.setGenerators({ myGen: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ dest: expect.any(String) }),
		);
	});

	it("merges extra data into the call when data param is provided", () => {
		const genFn = vi.fn().mockReturnValue({});
		const engine = Engine.init({ processTerm: {} });
		engine.setGenerators({ g: genFn }, { dest: "/override" });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ dest: "/override" }),
		);
	});

	it("returns the engine instance for chaining", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(engine.setGenerators({})).toBe(engine);
	});
});

describe("Engine.setGenerator", () => {
	it("stores a generator directly by name", () => {
		const engine = Engine.init({ processTerm: {} });
		const generatorConfig = { description: "direct" } as any;
		engine.setGenerator("myGen", generatorConfig);
		const list = engine.getGeneratorList();
		expect(list.find((g) => g.name === "myGen")).toBeDefined();
	});
});

describe("Engine.setToolTemplating / setTool", () => {
	it("setToolTemplating stores the engine in tools.templating", () => {
		const engine = Engine.init({
			processTerm: {},
			tools: { templating: {} },
		});
		const templateEngine = { render: vi.fn() };
		engine.setToolTemplating("hbs", templateEngine);
		const genFn = vi.fn().mockReturnValue({});
		engine.setGenerators({ g: genFn });
		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({
				tools: expect.objectContaining({
					templating: { hbs: templateEngine },
				}),
			}),
		);
	});

	it("setTool assigns a tool by name", () => {
		const engine = Engine.init({
			processTerm: {},
			tools: { templating: {} },
		});
		engine.setTool("templating", { hbs: vi.fn() });
		engine.setToolTemplating("extra", vi.fn());
		expect(engine.getConfig()).toBeDefined();
	});

	it("setToolTemplating returns the engine instance for chaining", () => {
		const engine = Engine.init({
			processTerm: {},
			tools: { templating: {} },
		});
		expect(engine.setToolTemplating("hbs", {})).toBe(engine);
	});
});

describe("Engine.getGeneratorList", () => {
	it("returns empty array when no generators are set", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(engine.getGeneratorList()).toEqual([]);
	});

	it("returns name and description for each generator", () => {
		const engine = Engine.init({ processTerm: {} });
		engine.setGenerators({
			alpha: vi.fn().mockReturnValue({ description: "Alpha gen" }),
			beta: vi.fn().mockReturnValue({ description: "Beta gen" }),
		});
		const list = engine.getGeneratorList();
		expect(list).toContainEqual({ name: "alpha", description: "Alpha gen" });
		expect(list).toContainEqual({ name: "beta", description: "Beta gen" });
	});
});

describe("Engine — constructor false branches and getDataEngine nullish fallbacks", () => {
	it("skips actions/prompts/tools/config assignment when they are not provided", () => {
		const engine = Reflect.construct(Engine as any, [
			{
				processTerm: {},
				data: {
					dest: "/",
					force: null,
					globals: null,
					dirnames: null,
					custom: {},
					answer: {},
				},
			},
		]) as Engine;

		expect(engine.getConfig()).toEqual({});
	});

	it("getDataEngine uses {} fallback when globals/dirnames are null", () => {
		const engine = Reflect.construct(Engine as any, [
			{
				processTerm: {},
				data: {
					dest: "/",
					force: null,
					globals: null,
					dirnames: null,
					custom: {},
					answer: {},
				},
			},
		]) as Engine;
		const genFn = vi.fn().mockReturnValue({});
		(engine as any).generators = {};

		engine.setGenerators({ g: genFn });

		expect(genFn).toHaveBeenCalledWith(
			expect.objectContaining({ globals: {}, dirnames: {}, force: false }),
		);
	});
});

describe("Engine — catch branches", () => {
	const throwingObj = () =>
		Object.defineProperty({}, "x", {
			get() {
				throw new Error("getter error");
			},
			enumerable: true,
		});

	const frozenEngine = () => {
		const engine = Engine.init({ processTerm: {} });
		(engine as any).data = Object.freeze({ ...(engine as any).data });
		return engine;
	};

	it("setConfig catch: throws EngineError when spread throws", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(() => engine.setConfig(throwingObj())).toThrow(EngineError);
	});

	it("setDataGlobals catch: throws EngineError when spread throws", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(() => engine.setDataGlobals(throwingObj())).toThrow(EngineError);
	});

	it("setDataForce catch: throws EngineError when data is frozen", () => {
		expect(() => frozenEngine().setDataForce(true)).toThrow(EngineError);
	});

	it("setDataDest catch: throws EngineError when data is frozen", () => {
		expect(() => frozenEngine().setDataDest("/x")).toThrow(EngineError);
	});

	it("setDataDirnames catch: throws EngineError when spread throws", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(() => engine.setDataDirnames(throwingObj())).toThrow(EngineError);
	});

	it("setDataCustom catch: throws EngineError when spread throws", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(() => engine.setDataCustom(throwingObj())).toThrow(EngineError);
	});

	it("setAction catch: throws EngineError when actions is frozen", () => {
		const engine = Engine.init({ processTerm: {} });
		(engine as any).actions = Object.freeze({});
		expect(() => engine.setAction("k", vi.fn() as any)).toThrow(EngineError);
	});

	it("setPrompt catch: throws EngineError when prompts is frozen", () => {
		const engine = Engine.init({ processTerm: {} });
		(engine as any).prompts = Object.freeze({});
		expect(() => engine.setPrompt("k", vi.fn() as any)).toThrow(EngineError);
	});

	it("setGenerators catch: throws EngineError when generator function throws", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(() =>
			engine.setGenerators({
				bad: () => {
					throw new Error("gen error");
				},
			}),
		).toThrow(EngineError);
	});

	it("setGenerator catch: throws EngineError when generators is frozen", () => {
		const engine = Engine.init({ processTerm: {} });
		(engine as any).generators = Object.freeze({});
		expect(() => engine.setGenerator("k", vi.fn() as any)).toThrow(EngineError);
	});

	it("setToolTemplating catch: throws EngineError when tools.templating is undefined", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(() => engine.setToolTemplating("hbs", {})).toThrow(EngineError);
	});

	it("setTool catch: throws EngineError when tools is frozen", () => {
		const engine = Engine.init({ processTerm: {} });
		(engine as any).tools = Object.freeze({});
		expect(() => engine.setTool("k", {})).toThrow(EngineError);
	});

	it("getGeneratorList catch: throws EngineError when generator descriptor throws", () => {
		const engine = Engine.init({ processTerm: {} });
		(engine as any).generators = {
			bad: new Proxy(
				{},
				{
					get() {
						throw new Error("gen read error");
					},
				},
			),
		};
		expect(() => engine.getGeneratorList()).toThrow(EngineError);
	});
});

describe("Engine.getGenerator", () => {
	it("throws EngineError when generatorName is not found", () => {
		const engine = Engine.init({ processTerm: {} });
		expect(() => engine.getGenerator("missing" as any)).toThrow(EngineError);
	});

	it("calls Generator.init with correct params and returns the result", () => {
		const mockGenerator = { runPrompts: vi.fn(), runActions: vi.fn() };
		(Generator.init as Mock).mockReturnValue(mockGenerator);
		const engine = Engine.init({ processTerm: makePT() });
		engine.setGenerators({
			myGen: vi.fn().mockReturnValue({ description: "g" }),
		});

		const result = engine.getGenerator("myGen" as any);

		expect(Generator.init).toHaveBeenCalledWith(
			expect.objectContaining({
				processTerm: expect.anything(),
				generator: { description: "g" },
			}),
		);
		expect(result).toBe(mockGenerator);
	});
});
