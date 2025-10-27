import { describe, expect, it, vi } from "vitest";
import { ResultKO } from "./ResultKO";
import { ResultOK } from "./ResultOK";

describe("ResultOK", () => {
	it("getResult returns status OK with where and data", () => {
		const result = ResultOK.init("myFn()", { name: "Alice" });

		expect(result.GetResult()).toEqual({
			status: "OK",
			where: "myFn()",
			data: { name: "Alice" },
		});
	});

	it("preserves the exact data object passed", () => {
		const data = { count: 42, items: ["a", "b"] };
		const shape = ResultOK.init("fn", data).GetResult();

		if (shape.status === "OK") {
			expect(shape.data).toEqual(data);
		}
	});

	it("where is set correctly", () => {
		const result = ResultOK.init("SomeClass.method()", { ok: true });

		expect(result.GetResult().where).toBe("SomeClass.method()");
	});

	it("Match calls success with data", () => {
		const result = ResultOK.init("fn", { value: 42 });

		const out = result.Match(
			(data) => data.value,
			() => -1,
		);

		expect(out).toBe(42);
	});

	it("Match never calls error", () => {
		const result = ResultOK.init("fn", { value: 1 });
		const error = vi.fn();

		result.Match(() => null, error);

		expect(error).not.toHaveBeenCalled();
	});

	it("Then calls fn with data and returns its result", () => {
		const result = ResultOK.init("fn", { value: 1 });
		const next = ResultOK.init("fn2", { doubled: 2 });

		const out = result.Then(() => next);

		expect(out).toBe(next);
	});

	it("ThenAsync calls fn with data and returns its result", async () => {
		const result = ResultOK.init("fn", { value: 1 });
		const next = ResultKO.init("fn2", "err", {});

		const out = await result.ThenAsync(() => Promise.resolve(next));

		expect(out).toBe(next);
	});

	it("two instances are independent", () => {
		const s1 = ResultOK.init("fn1", { x: 1 }).GetResult();
		const s2 = ResultOK.init("fn2", { x: 2 }).GetResult();

		expect(s1.where).toBe("fn1");
		expect(s2.where).toBe("fn2");
		if (s1.status === "OK" && s2.status === "OK") {
			expect(s1.data).toEqual({ x: 1 });
			expect(s2.data).toEqual({ x: 2 });
		}
	});
});
