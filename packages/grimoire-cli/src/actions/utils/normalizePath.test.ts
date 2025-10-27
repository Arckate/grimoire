import path from "node:path";
import { describe, expect, it } from "vitest";
import { normalizePath } from "./normalizePath";

describe("normalizePath", () => {
	it("should replace backslashes with slashes on Windows", () => {
		Object.assign(path, { sep: "\\" });
		const input = "C:\\Users\\Charles\\project";
		const result = normalizePath(input);
		expect(result).toBe("C:/Users/Charles/project");
	});

	it("should return input unchanged on POSIX systems", () => {
		Object.assign(path, { sep: "/" });
		const input = "/home/Charles/project";
		const result = normalizePath(input);
		expect(result).toBe(input);
	});

	it("should replace backslashes if path.sep is falsy", () => {
		Object.assign(path, { sep: "" });
		const input = "C:\\fallback\\test";
		const result = normalizePath(input);
		expect(result).toBe("C:/fallback/test");
	});
});
