import { describe, expect, it } from "vitest";
import { setValues } from "./setValues";

describe("setValues", () => {
	it("should return base value when keys is empty", () => {
		// Arrange/Act
		const result = setValues({ value: { foo: "bar" }, keys: {} }, "", {});

		// Assert
		expect(result).toEqual({ foo: "bar" });
	});

	it("should set simple string keys from args", () => {
		// Arrange/Act
		const result = setValues({ value: {}, keys: { name: "firstName" } }, "", {
			firstName: "Alice",
		});

		// Assert
		expect(result).toEqual({ name: "Alice" });
	});

	it("should apply namespace with capitalizeFirst", () => {
		// Arrange/Act
		const result = setValues(
			{ value: {}, keys: { name: "firstName" } },
			"user",
			{ userFirstName: "Bob" },
		);

		// Assert
		expect(result).toEqual({ name: "Bob" });
	});

	it("should handle nested object keys", () => {
		// Arrange/Act
		const result = setValues(
			{ value: {}, keys: { profile: { name: "firstName", age: "age" } } },
			"user",
			{ userFirstName: "Charlie", userAge: "30" },
		);

		// Assert
		expect(result).toEqual({ profile: { name: "Charlie", age: "30" } });
	});

	it("should merge with existing value", () => {
		// Arrange/Act
		const result = setValues(
			{
				value: { profile: { name: "Old" } },
				keys: { profile: { name: "firstName" } },
			},
			"",
			{ firstName: "New" },
		);

		// Assert
		expect(result).toEqual({ profile: { name: "New" } });
	});
	it("should ignore missing nested keys", () => {
		// Arrange/Act
		const result = setValues(
			{ value: {}, keys: { profile: { name: "firstName", age: "age" } } },
			"user",
			{ userFirstName: "Bob" },
		);

		// Assert
		expect(result).toEqual({ profile: { name: "Bob" } });
	});
	it("should ignore value when args does not contain the namespaced key", () => {
		const result = setValues(
			{ value: {}, keys: { name: "firstName" } },
			"user",
			{}, // args missing userFirstName
		);
		expect(result).toEqual({});
	});
});
