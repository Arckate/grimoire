import { beforeEach, describe, expect, it } from "vitest";
import { ROOTS } from "~/const/roots";
import { clearRoots, getRoots, setRoots } from "./roots";

describe("roots store", () => {
	beforeEach(() => {
		clearRoots();
	});

	it("sets ROOTS.PARENT correctly", () => {
		// Arrange/Act
		setRoots({ [ROOTS.PARENT]: "/parent" });

		// Assert
		expect(getRoots(ROOTS.PARENT)).toBe("/parent");
		expect(getRoots(ROOTS.ROOT)).toBeNull();
	});

	it("sets ROOTS.ROOT correctly", () => {
		// Arrange/Act
		setRoots({ [ROOTS.ROOT]: "/root" });

		// Assert
		expect(getRoots(ROOTS.ROOT)).toBe("/root");
		expect(getRoots(ROOTS.PARENT)).toBeNull();
	});

	it("sets both ROOTS", () => {
		// Arrange/Act
		setRoots({
			[ROOTS.PARENT]: "/parent",
			[ROOTS.ROOT]: "/root",
		});

		// Assert
		expect(getRoots(ROOTS.PARENT)).toBe("/parent");
		expect(getRoots(ROOTS.ROOT)).toBe("/root");
	});

	it("ignores falsy values in setRoots", () => {
		// Arrange/Act
		setRoots({
			[ROOTS.PARENT]: null,
			[ROOTS.ROOT]: undefined,
		});

		// Assert
		expect(getRoots(ROOTS.PARENT)).toBeNull();
		expect(getRoots(ROOTS.ROOT)).toBeNull();
	});

	it("clears all roots", () => {
		// Arrange/Act
		setRoots({
			[ROOTS.PARENT]: "/parent",
			[ROOTS.ROOT]: "/root",
		});

		clearRoots();

		// Assert
		expect(getRoots(ROOTS.PARENT)).toBeNull();
		expect(getRoots(ROOTS.ROOT)).toBeNull();
	});
});
