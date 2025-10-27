import { afterEach, describe, expect, it, vi } from "vitest";
import { Results } from "~/engine";
import type { EngineData, ProcessTerm } from "~/models";
import { Prompt } from "./Prompt";

const processTerm = {
	stdin: process.stdin,
	stderr: process.stderr,
	stdout: process.stdout,
	exit: process.exit,
	cwd: process.cwd,
} as ProcessTerm;

const data: EngineData = {
	dest: "/tmp",
	force: false,
	globals: {},
	dirnames: {},
	custom: {},
	answer: {},
};

type FlatConfig = { type: string } & Record<string, any>;
type FlatPrompt = {
	once: (config: FlatConfig) => Promise<any[]>;
	list: (configs: FlatConfig[]) => Promise<any[]>;
	run: (configs: FlatConfig[], findDoc?: boolean) => Promise<any>;
	return: (findDoc?: boolean) => Promise<any>;
	getData: () => any;
	setDoc: (doc: FlatConfig[] | Record<string, any>) => void;
};

const makePrompt = (
	bypass: string[] | Record<string, string>,
	prompts: Record<string, any> = {},
): FlatPrompt =>
	Prompt.init({ processTerm, prompts, data, bypass }) as unknown as FlatPrompt;

describe("Prompt.once", () => {
	it("calls the prompt fn with correct params", async () => {
		const mockFn = vi.fn(() => ({}));
		const prompt = makePrompt([], { text: mockFn });

		await prompt.once({
			type: "text",
			keyValue: "username",
			message: "Enter name",
		});

		expect(mockFn).toHaveBeenCalledWith({
			keyValue: "username",
			message: "Enter name",
			defaultValue: undefined,
			config: {},
			processTerm,
			data,
			value: "",
		});
	});

	it("pushes ResultOK when promptFn returns a value", async () => {
		const mockFn = vi.fn(() => ({ answer: "hello" }));
		const prompt = makePrompt([], { text: mockFn });

		const results = await prompt.once({
			type: "text",
			keyValue: "username",
			message: "Enter name",
		});

		expect(results).toHaveLength(1);
		expect(results[0].GetResult()).toMatchObject({
			status: "OK",
			data: { type: "text", name: "username", value: { answer: "hello" } },
		});
	});

	it("pushes ResultOK when promptFn returns a Promise", async () => {
		const mockFn = vi.fn(async () => ({ answer: "hello" }));
		const prompt = makePrompt([], { text: mockFn });

		const results = await prompt.once({
			type: "text",
			keyValue: "username",
			message: "Enter name",
		});

		expect(results).toHaveLength(1);
		expect(results[0].GetResult()).toMatchObject({
			status: "OK",
			data: { type: "text", name: "username", value: { answer: "hello" } },
		});
	});

	it("accumulates results across multiple once calls", async () => {
		const prompt = makePrompt([], {
			text: vi.fn(() => "alice"),
			number: vi.fn(() => 42),
		});

		await prompt.once({ type: "text", keyValue: "name", message: "m" });
		const results = await prompt.once({
			type: "number",
			keyValue: "age",
			message: "m",
		});

		expect(results).toHaveLength(2);
	});

	it("skips the prompt and returns current results when 'when' returns false", async () => {
		const mockFn = vi.fn(() => ({}));
		const prompt = makePrompt([], { text: mockFn });

		const results = await prompt.once({
			type: "text",
			keyValue: "x",
			message: "m",
			when: () => false,
		});

		expect(mockFn).not.toHaveBeenCalled();
		expect(results).toHaveLength(0);
	});

	it("calls the prompt fn when 'when' returns true", async () => {
		const mockFn = vi.fn(() => ({}));
		const prompt = makePrompt([], { text: mockFn });

		await prompt.once({
			type: "text",
			keyValue: "x",
			message: "m",
			when: () => true,
		});

		expect(mockFn).toHaveBeenCalledOnce();
	});

	it("pushes ResultKO and marks hasError when promptFn throws", async () => {
		const mockFn = vi.fn(() => {
			throw new Error("prompt failed");
		});
		const prompt = makePrompt([], { text: mockFn });

		const results = await prompt.once({
			type: "text",
			keyValue: "username",
			message: "Enter name",
		});

		expect(results).toHaveLength(1);
		expect(results[0].GetResult()).toMatchObject({ status: "KO" });
		expect(prompt.getData().GetResult()).toMatchObject({ status: "KO" });
	});
});

describe("Prompt.once — findDefaultValue", () => {
	it("shifts first array bypass value into value", async () => {
		const mockFn = vi.fn(() => ({}));
		const prompt = makePrompt(["myDefault"], { text: mockFn });

		await prompt.once({ type: "text", keyValue: "x", message: "m" });

		expect(mockFn).toHaveBeenCalledWith(
			expect.objectContaining({ value: "myDefault" }),
		);
	});

	it("passes empty string into value when bypass array is empty", async () => {
		const mockFn = vi.fn(() => ({}));
		const prompt = makePrompt([], { text: mockFn });

		await prompt.once({ type: "text", keyValue: "x", message: "m" });

		expect(mockFn).toHaveBeenCalledWith(
			expect.objectContaining({ value: "" }),
		);
	});

	it("passes empty string into value when bypass array value is SKIP_PARAMS_VALUE (_)", async () => {
		const mockFn = vi.fn(() => ({}));
		const prompt = makePrompt(["_"], { text: mockFn });

		await prompt.once({ type: "text", keyValue: "x", message: "m" });

		expect(mockFn).toHaveBeenCalledWith(
			expect.objectContaining({ value: "" }),
		);
	});

	it("passes record bypass value matched by config keyValue into value", async () => {
		const mockFn = vi.fn(() => ({}));
		const prompt = makePrompt({ x: "recordValue" }, { text: mockFn });

		await prompt.once({ type: "text", keyValue: "x", message: "m" });

		expect(mockFn).toHaveBeenCalledWith(
			expect.objectContaining({ value: "recordValue" }),
		);
	});

	it("passes empty string into value when record has no matching key", async () => {
		const mockFn = vi.fn(() => ({}));
		const prompt = makePrompt({ other: "value" }, { text: mockFn });

		await prompt.once({ type: "text", keyValue: "x", message: "m" });

		expect(mockFn).toHaveBeenCalledWith(
			expect.objectContaining({ value: "" }),
		);
	});
});

describe("Prompt.getData", () => {
	it("returns merged answers keyed by keyValue", async () => {
		const prompt = makePrompt([], {
			text: vi.fn(() => "alice"),
			number: vi.fn(() => 42),
		});

		await prompt.once({ type: "text", keyValue: "name", message: "m" });
		await prompt.once({ type: "number", keyValue: "age", message: "m" });

		const result = prompt.getData().GetResult();

		expect(result).toMatchObject({
			status: "OK",
			data: { name: "alice", age: 42 },
		});
	});

	it("returns ResultKO when hasError is true", async () => {
		const prompt = makePrompt([], {
			text: vi.fn(() => {
				throw new Error("fail");
			}),
		});

		await prompt.once({ type: "text", keyValue: "x", message: "m" });

		expect(prompt.getData().GetResult()).toMatchObject({ status: "KO" });
	});

	it("skips KO results when accumulating answers", async () => {
		const mockFn = vi.fn(() => "val");
		const prompt = makePrompt([], { text: mockFn });

		const fakeKO = Results.returnError("Prompt: once", "injected", {
			type: "text",
			name: "x",
		});
		vi.spyOn(Results, "returnResponse").mockReturnValueOnce(fakeKO as any);

		await prompt.once({ type: "text", keyValue: "x", message: "m" });

		const result = prompt.getData().GetResult();
		expect(result).toMatchObject({ status: "OK", data: {} });
	});
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("Prompt.setDoc", () => {
	it("wraps array input in { values }", async () => {
		const prompt = makePrompt([], {});
		const configs = [{ type: "text", keyValue: "x", message: "m" }];

		prompt.setDoc(configs);

		const result = (await prompt.return(true)).GetResult();
		expect(result).toMatchObject({ status: "OK", data: { values: configs } });
	});

	it("sets object doc directly", async () => {
		const prompt = makePrompt([], {});
		const doc = { comment: "Documentation", values: [] };

		prompt.setDoc(doc);

		const result = (await prompt.return(true)).GetResult();
		expect(result).toMatchObject({ status: "OK", data: doc });
	});
});

describe("Prompt.return", () => {
	it("returns results array when findDoc is false", async () => {
		const prompt = makePrompt([], { text: vi.fn(() => "val") });

		await prompt.once({ type: "text", keyValue: "x", message: "m" });
		const result = (await prompt.return(false)).GetResult();

		expect(result.status).toBe("OK");
		if (result.status === "OK") {
			expect(Array.isArray(result.data)).toBe(true);
			expect(result.data).toHaveLength(1);
		}
	});

	it("returns undefined when findDoc is true and no doc has been set", async () => {
		const prompt = makePrompt([], {});

		const result = (await prompt.return(true)).GetResult();

		expect(result).toMatchObject({ status: "OK", data: undefined });
	});

	it("returns doc when findDoc is true and doc has been set", async () => {
		const prompt = makePrompt([], {});
		prompt.setDoc({ comment: "docs", values: [] });

		const result = (await prompt.return(true)).GetResult();

		expect(result).toMatchObject({
			status: "OK",
			data: { comment: "docs", values: [] },
		});
	});
});

describe("Prompt.list", () => {
	it("does not execute when hasError is false", async () => {
		const mockFn = vi.fn(() => "val");
		const prompt = makePrompt([], { text: mockFn });

		const results = await prompt.list([
			{ type: "text", keyValue: "x", message: "m" },
		]);

		expect(mockFn).not.toHaveBeenCalled();
		expect(results).toHaveLength(0);
	});

	it("executes once when hasError is true and configs has exactly one item", async () => {
		const throwFn = vi.fn(() => {
			throw new Error("fail");
		});
		const prompt = makePrompt([], { text: throwFn });

		await prompt.once({ type: "text", keyValue: "x", message: "m" });
		await prompt.list([{ type: "text", keyValue: "x", message: "m" }]);

		expect(throwFn).toHaveBeenCalledTimes(2);
	});
});

describe("Prompt.run", () => {
	it("sets doc and returns results", async () => {
		const prompt = makePrompt([], {});
		const configs = [{ type: "text", keyValue: "x", message: "m" }];

		const result = (await prompt.run(configs)).GetResult();

		expect(result.status).toBe("OK");
	});

	it("returns doc when findDoc is true", async () => {
		const prompt = makePrompt([], {});
		const configs = [{ type: "text", keyValue: "x", message: "m" }];

		const result = (await prompt.run(configs, true)).GetResult();

		expect(result).toMatchObject({ status: "OK", data: { values: configs } });
	});
});
