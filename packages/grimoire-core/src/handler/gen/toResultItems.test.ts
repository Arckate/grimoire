import { describe, expect, it } from "vitest";
import type { IResult } from "~/engine";
import { toResultItems } from "./toResultItems";

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

describe("toResultItems", () => {
	it("returns result:false and a single KO item when the top-level result is KO", () => {
		const { result, items } = toResultItems(makeIResult("KO", {}, "top-level error"));

		expect(result).toBe(false);
		expect(items).toEqual([{ isValid: false, data: { message: "top-level error" } }]);
	});

	it("returns result:true and empty items when data is not an array", () => {
		const { result, items } = toResultItems(makeIResult("OK", { x: 1 }));

		expect(result).toBe(true);
		expect(items).toEqual([]);
	});

	it("returns result:true and empty items when data is an empty array", () => {
		const { result, items } = toResultItems(makeIResult("OK", []));

		expect(result).toBe(true);
		expect(items).toEqual([]);
	});

	it("returns result:true and maps an OK sub-result to isValid:true", () => {
		const sub = makeIResult("OK", { type: "create", name: "File", value: "file.ts" });
		const { result, items } = toResultItems(makeIResult("OK", [sub]));

		expect(result).toBe(true);
		expect(items).toEqual([
			{ isValid: true, data: { type: "create", name: "File", value: "file.ts" } },
		]);
	});

	it("returns result:false and stops at the first KO sub-result", () => {
		const sub = makeIResult("KO", {}, "partial fail");
		const { result, items } = toResultItems(makeIResult("OK", [sub]));

		expect(result).toBe(false);
		expect(items).toEqual([{ isValid: false, data: { message: "partial fail" } }]);
	});

	it("stops after the first KO and does not include subsequent items", () => {
		const sub1 = makeIResult("OK", { type: "create", name: "A", value: "a.ts" });
		const sub2 = makeIResult("KO", {}, "fail");
		const sub3 = makeIResult("OK", { type: "update", name: "B", value: "b.ts" });
		const { result, items } = toResultItems(makeIResult("OK", [sub1, sub2, sub3]));

		expect(result).toBe(false);
		expect(items).toEqual([
			{ isValid: true, data: { type: "create", name: "A", value: "a.ts" } },
			{ isValid: false, data: { message: "fail" } },
		]);
	});

	it("returns result:true when all sub-results are OK", () => {
		const sub1 = makeIResult("OK", { type: "create", name: "A", value: "a.ts" });
		const sub2 = makeIResult("OK", { type: "update", name: "B", value: "b.ts" });
		const { result, items } = toResultItems(makeIResult("OK", [sub1, sub2]));

		expect(result).toBe(true);
		expect(items).toEqual([
			{ isValid: true, data: { type: "create", name: "A", value: "a.ts" } },
			{ isValid: true, data: { type: "update", name: "B", value: "b.ts" } },
		]);
	});
});
