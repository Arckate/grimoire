import { describe, expect, it, vi } from "vitest";
import { ResultError } from "~/errors";
import { ResultKO } from "./ResultKO";
import { ResultOK } from "./ResultOK";

describe("ResultKO", () => {
	it("getResult returns status KO with where", () => {
		const result = ResultKO.init("myFn()", "something went wrong", {});

		const shape = result.GetResult();
		expect(shape.status).toBe("KO");
		expect(shape.where).toBe("myFn()");
	});

	it("error is a ResultError instance", () => {
		const result = ResultKO.init("fn", "bad input", {});

		const shape = result.GetResult();
		if (shape.status === "KO") {
			expect(shape.error).toBeInstanceOf(ResultError);
		}
	});

	it("error carries the correct message", () => {
		const result = ResultKO.init("fn", "bad input", {});

		const shape = result.GetResult();
		if (shape.status === "KO") {
			expect(shape.error.message).toBe("bad input");
		}
	});

	it("error carries the data passed to init", () => {
		const data = { field: "email" };
		const result = ResultKO.init("fn", "invalid", data);

		const shape = result.GetResult();
		if (shape.status === "KO") {
			expect(shape.error.data).toEqual(data);
		}
	});

	it("two instances are independent", () => {
		const r1 = ResultKO.init("fn1", "err1", { a: 1 });
		const r2 = ResultKO.init("fn2", "err2", { b: 2 });

		expect(r1.GetResult().where).toBe("fn1");
		expect(r2.GetResult().where).toBe("fn2");
	});

	it("Match calls error with the ResultError", () => {
		const result = ResultKO.init("fn", "something failed", { x: 1 });

		const out = result.Match(
			() => "ok",
			(err) => err.message,
		);

		expect(out).toBe("something failed");
	});

	it("Match never calls success", () => {
		const result = ResultKO.init("fn", "err", {});
		const success = vi.fn();

		result.Match(success, () => null);

		expect(success).not.toHaveBeenCalled();
	});

	it("Then ignores fn and returns itself", () => {
		const result = ResultKO.init("fn", "err", {});
		const fn = vi.fn(() => ResultOK.init("fn2", { x: 1 }));

		const out = result.Then(fn);

		expect(fn).not.toHaveBeenCalled();
		expect(out.GetResult().status).toBe("KO");
	});

	it("ThenAsync ignores fn and resolves with itself", async () => {
		const result = ResultKO.init("fn", "err", {});
		const fn = vi.fn(() => Promise.resolve(ResultOK.init("fn2", { x: 1 })));

		const out = await result.ThenAsync(fn);

		expect(fn).not.toHaveBeenCalled();
		expect(out.GetResult().status).toBe("KO");
	});
});
