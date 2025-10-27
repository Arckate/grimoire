import { beforeEach, describe, expect, it } from "vitest";
import { clearGlobalConfig, getGlobalConfig, setGlobalConfig } from "./global";

describe("globalConfig store", () => {
	beforeEach(() => {
		clearGlobalConfig();
	});

	it("sets and gets globalConfig correctly", () => {
		// Arrange/Act
		const config = { configFile: "custom.json", rootKey: "customRoot" };

		setGlobalConfig(config);

		// Act
		const result = getGlobalConfig();

		// Assert
		expect(result).toEqual(config);
	});

	it("returns a copy, not a reference", () => {
		// Arrange
		const config = { configFile: "custom.json" };
		setGlobalConfig(config);
		// Act
		const result = getGlobalConfig();
		result.configFile = "hacked.json";

		// Assert
		expect(getGlobalConfig().configFile).toBe("custom.json");
	});

	it("clears globalConfig", () => {
		// Arrange
		setGlobalConfig({ configFile: "custom.json" });

		// Act
		clearGlobalConfig();

		// Assert
		expect(getGlobalConfig()).toEqual({});
	});
});
