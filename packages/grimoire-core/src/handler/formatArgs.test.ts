import { describe, expect, it } from "vitest";
import { formatArgs } from "./formatArgs";

describe("formatArgs", () => {
	it("returns the array as-is when args contains strings", () => {
		const input = ["--name", "project"];

		expect(formatArgs(input)).toEqual(["--name", "project"]);
	});

	it("returns an empty array when args is empty", () => {
		expect(formatArgs([])).toEqual([]);
	});

	it("returns the first element when args contains a single object", () => {
		const input = [{ name: "project", type: "ts" }];

		expect(formatArgs(input)).toEqual({ name: "project", type: "ts" });
	});

	it("returns the array as-is when first element is a string even if others are objects", () => {
		const input = ["--name", { name: "project" }] as (
			| string
			| Record<string, string>
		)[];

		expect(formatArgs(input)).toEqual(input);
	});
});
