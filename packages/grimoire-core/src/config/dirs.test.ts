import { beforeEach, describe, expect, it } from "vitest";
import { DIRS } from "~/const/dirs";
import { clearDirs, getDirs, setDirs } from "./dirs";

describe("dirs store", () => {
	beforeEach(() => {
		clearDirs();
	});

	it("sets DIR correctly", () => {
		// Arrange/Act
		setDirs({ [DIRS.DIR]: "/custom" });

		// Assert
		expect(getDirs(DIRS.DIR)).toBe("/custom");
		expect(getDirs(DIRS.DEFAULT_DIR)).toBeNull();
		expect(getDirs(DIRS.IN_PATH)).toBeNull();
	});

	it("sets DEFAULT_DIR correctly", () => {
		// Arrange/Act
		setDirs({ [DIRS.DEFAULT_DIR]: "/default" });

		// Assert
		expect(getDirs(DIRS.DEFAULT_DIR)).toBe("/default");
		expect(getDirs(DIRS.DIR)).toBeNull();
		expect(getDirs(DIRS.IN_PATH)).toBeNull();
	});

	it("sets IN_PATH correctly", () => {
		// Arrange/Act
		setDirs({ [DIRS.IN_PATH]: "/in/path" });

		// Assert
		expect(getDirs(DIRS.IN_PATH)).toBe("/in/path");
		expect(getDirs(DIRS.DIR)).toBeNull();
		expect(getDirs(DIRS.DEFAULT_DIR)).toBeNull();
	});

	it("sets multiple dirs at once", () => {
		// Arrange/Act
		setDirs({
			[DIRS.DIR]: "/custom",
			[DIRS.DEFAULT_DIR]: "/default",
			[DIRS.IN_PATH]: "/in/path",
		});

		// Assert
		expect(getDirs(DIRS.DIR)).toBe("/custom");
		expect(getDirs(DIRS.DEFAULT_DIR)).toBe("/default");
		expect(getDirs(DIRS.IN_PATH)).toBe("/in/path");
	});

	it("ignores falsy values in setDirs", () => {
		// Arrange/Act
		setDirs({
			[DIRS.DIR]: null,
			[DIRS.DEFAULT_DIR]: undefined,
			[DIRS.IN_PATH]: "",
		});

		// Assert
		expect(getDirs(DIRS.DIR)).toBeNull();
		expect(getDirs(DIRS.DEFAULT_DIR)).toBeNull();
		expect(getDirs(DIRS.IN_PATH)).toBeNull();
	});

	it("clears all dirs", () => {
		// Arrange
		setDirs({
			[DIRS.DIR]: "/custom",
			[DIRS.DEFAULT_DIR]: "/default",
			[DIRS.IN_PATH]: "/in/path",
		});

		// Act
		clearDirs();

		//Assert
		expect(getDirs(DIRS.DIR)).toBeNull();
		expect(getDirs(DIRS.DEFAULT_DIR)).toBeNull();
		expect(getDirs(DIRS.IN_PATH)).toBeNull();
	});
});
