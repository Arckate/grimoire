import { describe, expect, it } from "vitest";
import { ResultKO } from "./ResultKO";
import { ResultOK } from "./ResultOK";
import { Results } from "./Results";

describe("Results", () => {
	it("returnResponse returns a ResultOK instance", () => {
		const result = Results.returnResponse("myFn()", { value: 1 });

		expect(result).toBeInstanceOf(ResultOK);
	});

	it("returnResponse result has status OK and correct data", () => {
		const shape = Results.returnResponse("myFn()", { value: 1 }).GetResult();

		expect(shape.status).toBe("OK");
		if (shape.status === "OK") {
			expect(shape.data).toEqual({ value: 1 });
		}
	});

	it("returnResponse sets where correctly", () => {
		const result = Results.returnResponse("SomeClass.fn()", { ok: true });

		expect(result.GetResult().where).toBe("SomeClass.fn()");
	});

	it("returnError returns a ResultKO instance", () => {
		const result = Results.returnError("myFn()", "something failed", {
			values: [],
		});

		expect(result).toBeInstanceOf(ResultKO);
	});

	it("returnError result has status KO", () => {
		const result = Results.returnError("myFn()", "something failed", {});

		expect(result.GetResult().status).toBe("KO");
	});

	it("returnError carries the correct message", () => {
		const result = Results.returnError("fn", "timeout", {});

		const shape = result.GetResult();
		if (shape.status === "KO") {
			expect(shape.error.message).toBe("timeout");
		}
	});

	it("returnError carries the data passed", () => {
		const data = { values: ["x"] };
		const result = Results.returnError("fn", "fail", data);

		const shape = result.GetResult();
		if (shape.status === "KO") {
			expect(shape.error.data).toEqual(data);
		}
	});
});
