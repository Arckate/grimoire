import { describe, expect, it } from "vitest";
import { filterValues } from "./filterValues";

const tsStep = { ctorKey: "gen", params: { typeGen: "ts" } };
const jsStep = { ctorKey: "gen", params: { typeGen: "js" } };
const defaultStep = { ctorKey: "gen", params: { typeGen: "default" } };

describe("filterValues", () => {
	it("should return the step matching keyFilter in args", () => {
		const filter = {
			keyFilter: "type",
			defaultFilter: "default",
			values: { ts: tsStep, js: jsStep, default: defaultStep },
		};

		expect(filterValues(filter, { type: "ts" })).toBe(tsStep);
	});

	it("should return the default step if keyFilter is missing in args", () => {
		const filter = {
			keyFilter: "type",
			defaultFilter: "default",
			values: { ts: tsStep, js: jsStep, default: defaultStep },
		};

		expect(filterValues(filter, { name: "project" })).toBe(defaultStep);
	});

	it("should return undefined if args key maps to a missing entry in values", () => {
		const filter = {
			keyFilter: "type",
			defaultFilter: "default",
			values: { default: defaultStep },
		};

		expect(filterValues(filter, { type: "ts" })).toBeUndefined();
	});
});
