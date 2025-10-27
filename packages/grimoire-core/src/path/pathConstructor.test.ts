import path from "node:path";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { clearGlobalConfig, setGlobalConfig } from "~/config/global";
import { clearRoots, setRoots } from "~/config/roots";
import { CONFIG_FILE } from "~/const/config";
import { ROOTS } from "~/const/roots";
import { FilePathError } from "~/errors/FilePathError";
import { findRoots } from "./findRoots";
import { pathConstructor } from "./pathConstructor";

vi.mock("./findRoots");

beforeEach(() => {
	clearRoots();
	clearGlobalConfig();
});

describe("pathConstructor (with ~/ and ~~)", () => {
	it("uses ROOTS.PARENT when defined", async () => {
		// Arrange/Act
		setRoots({ [ROOTS.PARENT]: "/parent" });

		const result = await pathConstructor("~/folder");

		// Assert
		expect(result).toBe(path.join("/parent", "folder"));
	});

	it("uses ROOTS.ROOT when defined", async () => {
		// Arrange/Act
		setRoots({ [ROOTS.ROOT]: "/root" });

		const result = await pathConstructor("~~/folder");

		// Assert
		expect(result).toBe(path.join("/root", "folder"));
	});

	it("throws an error if ROOTS.PARENT is missing", async () => {
		// Arrange/Act/Assert
		setGlobalConfig({ configFile: "custom.json" });

		await expect(pathConstructor("~/folder")).rejects.toThrow(
			new FilePathError(
				`The ${ROOTS.PARENT} option requires at least one '${"custom.json"}' file to be present.`,
			),
		);
	});

	it("throws an error if ROOTS.ROOT is missing", async () => {
		// Arrange/Act/Assert
		setGlobalConfig({ configFile: "custom.json" });

		await expect(pathConstructor("~~/folder")).rejects.toThrow(
			new FilePathError(
				`The ${ROOTS.ROOT} option requires at least one '${"custom.json"}' file in which root parameter set to 'true'`,
			),
		);
	});

	it("uses ROOTS.PARENT from findRoots when not initially set", async () => {
		// Arrange/Act
		(findRoots as Mock).mockReturnValue({
			[ROOTS.PARENT]: "/found-parent",
		});

		setRoots({});
		const result = await pathConstructor("~/folder");

		// Assert
		expect(result).toBe(path.join("/found-parent", "folder"));
	});

	it("uses ROOTS.ROOT from findRoots when not initially set", async () => {
		// Arrange/Act
		(findRoots as Mock).mockReturnValue({
			[ROOTS.ROOT]: "/found-root",
		});

		clearRoots();
		const result = await pathConstructor("~~/folder");

		// Assert
		expect(result).toBe(path.join("/found-root", "folder"));
	});

	it("throws error for ROOTS.PARENT when getGlobalConfig is undefined", async () => {
		// Arrange/Act/Assert
		(findRoots as Mock).mockReturnValue(undefined);
		setGlobalConfig({ configFile: false as unknown as string });

		await expect(pathConstructor("~/folder")).rejects.toThrow(
			new FilePathError(
				`The ${ROOTS.PARENT} option requires at least one '${CONFIG_FILE}' file to be present.`,
			),
		);
	});

	it("throws error for ROOTS.ROOT when getGlobalConfig is undefined", async () => {
		// Arrange/Act/Assert
		(findRoots as Mock).mockReturnValue(undefined);
		setGlobalConfig({ configFile: false as unknown as string });

		await expect(pathConstructor("~~/folder")).rejects.toThrow(
			new FilePathError(
				`The ${ROOTS.ROOT} option requires at least one '${CONFIG_FILE}' file in which root parameter set to 'true'`,
			),
		);
	});

	it("returns absolute path as-is", async () => {
		// Arrange/Act
		const absolutePath = path.resolve("/home/emeric/project/file.ts");

		const result = await pathConstructor(absolutePath);

		// Assert
		expect(result).toBe(absolutePath);
	});

	it("joins relative path with oldPath when no prefix is matched", async () => {
		// Arrange/Act
		const result = await pathConstructor("relative/path", "/base");

		// Assert
		expect(result).toBe(path.join("/base", "relative/path"));
	});

	it("returns oldPath when strPath is falsy", async () => {
		// Arrange/Act
		const result = await pathConstructor(undefined, "/fallback");

		// Assert
		expect(result).toBe("/fallback");
	});
});
