import { beforeEach, describe, expect, it } from "vitest";
import { clearDirnames, getDirnames, setDirnames } from "./dirnames";

describe("dirnames state management", () => {
	beforeEach(() => {
		clearDirnames();
	});

	it("should set dirnames correctly", () => {
		// Arrange/Act
		setDirnames({ a: "foo", b: "bar" });

		// Assert
		expect(getDirnames()).toEqual({ a: "foo", b: "bar" });
	});

	it("should overwrite previous dirnames", () => {
		// Arrange/Act
		setDirnames({ a: "foo" });
		setDirnames({ b: "bar" });

		// Assert
		expect(getDirnames()).toEqual({ b: "bar" });
	});

	it("should return a copy, not a reference", () => {
		// Arrange
		setDirnames({ a: "foo" });

		// Act
		const result = getDirnames();
		result.a = "mutated";

		// Assert
		expect(getDirnames()).toEqual({ a: "foo" });
	});

	it("should clear dirnames", () => {
		// Arrange
		setDirnames({ a: "foo" });

		// Act
		clearDirnames();

		// Assert
		expect(getDirnames()).toEqual({});
	});
});
