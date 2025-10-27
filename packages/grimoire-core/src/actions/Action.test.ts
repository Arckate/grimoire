import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { Results } from "~/engine";
import type { ActionFn, EngineData } from "~/models";
import { formatError } from "~/utils";
import { Action } from "./Action";

vi.mock("~/engine/Results/Results", () => ({
	Results: {
		returnResponse: vi.fn(),
		returnError: vi.fn(),
	},
}));
vi.mock("~/utils/formatError", () => ({ formatError: vi.fn() }));

const makeData = (): EngineData => ({
	dest: "/",
	force: false,
	globals: {},
	dirnames: {},
	custom: {},
	answer: {},
});

const makeAction = (actionsMap: Record<string, ActionFn> = {}) =>
	Action.init({
		tools: {},
		actions: actionsMap as any,
		data: makeData(),
	});

const okResult = {
	status: "OK" as const,
	data: {},
	getResult: () => ({ status: "OK", data: {} }),
};
const koResult = {
	status: "KO" as const,
	error: {},
	getResult: () => ({ status: "KO", error: {} }),
};

beforeEach(() => {
	vi.resetAllMocks();
	(Results.returnResponse as Mock).mockReturnValue(okResult);
	(Results.returnError as Mock).mockReturnValue(koResult);
});

describe("Action.init", () => {
	it("returns an Action instance", () => {
		expect(makeAction()).toBeInstanceOf(Action);
	});
});

describe("Action.once", () => {
	it("awaits a Promise result and pushes OK response", async () => {
		const actionFn = vi.fn().mockResolvedValue("done");
		const action = makeAction({ create: actionFn });

		const results = await action.once({
			type: "create",
			name: "file.ts",
		} as any);

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: once",
			expect.objectContaining({ type: "create", value: "done" }),
		);
		expect(results).toHaveLength(1);
	});

	it("handles sync result and pushes OK response", async () => {
		const actionFn = vi.fn().mockReturnValue("sync-value");
		const action = makeAction({ create: actionFn });

		const results = await action.once({
			type: "create",
			name: "file.ts",
		} as any);

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: once",
			expect.objectContaining({ type: "create", value: "sync-value" }),
		);
		expect(results).toHaveLength(1);
	});

	it("pushes error result and sets hasError when action throws", async () => {
		const actionFn = vi.fn().mockImplementation(() => {
			throw new Error("action failed");
		});
		(formatError as Mock).mockReturnValue({ message: "action failed" });
		const action = makeAction({ create: actionFn });

		const results = await action.once({
			type: "create",
			name: "file.ts",
		} as any);

		expect(Results.returnError).toHaveBeenCalledWith(
			"Action: once",
			"action failed",
			expect.objectContaining({ type: "create" }),
		);
		expect(results).toHaveLength(1);
	});

	it("passes config, tools, and data to the action function", async () => {
		const actionFn = vi.fn().mockReturnValue(undefined);
		const tools = { fs: { write: vi.fn() } };
		const data = makeData();
		const action = Action.init({
			tools,
			actions: { create: actionFn } as any,
			data,
		});

		await action.once({ type: "create", name: "file.ts" } as any);

		expect(actionFn).toHaveBeenCalledWith(
			expect.objectContaining({ tools, data }),
		);
	});

	it("accumulates results across multiple once calls", async () => {
		const actionFn = vi.fn().mockReturnValue("ok");
		const action = makeAction({ create: actionFn });

		await action.once({ type: "create", name: "a.ts" } as any);
		const results = await action.once({ type: "create", name: "b.ts" } as any);

		expect(results).toHaveLength(2);
	});
});

describe("Action.list", () => {
	it("returns empty results when hasError is false", async () => {
		const action = makeAction({});

		const results = await action.list([{ type: "create" } as any]);

		expect(results).toHaveLength(0);
	});

	it("calls once when hasError is true and configs has one item", async () => {
		const actionFn = vi
			.fn()
			.mockImplementationOnce(() => {
				throw new Error("fail");
			})
			.mockReturnValue("retry-ok");
		(formatError as Mock).mockReturnValue({ message: "fail" });
		const action = makeAction({ create: actionFn });

		await action.once({ type: "create", name: "f" } as any);
		await action.list([{ type: "create", name: "f" } as any]);

		expect(actionFn).toHaveBeenCalledTimes(2);
	});
});

describe("Action.return", () => {
	it("returns results array when findDoc is false (default)", async () => {
		const action = makeAction({});

		await action.return();

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: return result ",
			expect.any(Array),
		);
	});

	it("returns doc when findDoc is true and doc is set via object", async () => {
		const action = makeAction({});
		const doc = { values: [], comment: "my actions" } as any;
		action.setDoc(doc);

		await action.return(true);

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: return doc",
			doc,
		);
	});

	it("calls returnResponse for missing doc when findDoc is true and no doc set", async () => {
		const action = makeAction({});

		await action.return(true);

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: return doc",
			expect.objectContaining({
				comment: "No documentation was provided for these actions.",
			}),
		);
	});
});

describe("Action.setDoc", () => {
	it("wraps array in { values } when given an array", async () => {
		const action = makeAction({});
		const docs = [{ type: "create" } as any];
		action.setDoc(docs);

		await action.return(true);

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: return doc",
			expect.objectContaining({ values: docs }),
		);
	});

	it("sets doc directly when given an object", async () => {
		const action = makeAction({});
		const doc = { values: [], comment: "direct" } as any;
		action.setDoc(doc);

		await action.return(true);

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: return doc",
			doc,
		);
	});
});

describe("Action.run", () => {
	it("calls setDoc, list, and return in sequence", async () => {
		const action = makeAction({});
		const configs: any[] = [];

		const result = await action.run(configs);

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: return result ",
			expect.any(Array),
		);
		expect(result).toBe(okResult);
	});

	it("passes findDoc to return", async () => {
		const action = makeAction({});
		const configs = [{ type: "create" }] as any;

		await action.run(configs, true);

		expect(Results.returnResponse).toHaveBeenCalledWith(
			"Action: return doc",
			expect.objectContaining({ values: configs }),
		);
	});
});
