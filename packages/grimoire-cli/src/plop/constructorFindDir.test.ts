import path from "node:path";
import {
	clearDirnames,
	clearDirs,
	clearGlobalConfig,
	clearRoots,
	setDirnames,
	setDirs,
	setGlobalConfig,
	setRoots,
} from "@arckate/grimoire-core/config";
import { CLI_FOLDER, DIRS, ROOTS } from "@arckate/grimoire-core/const";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { constructorFindDir } from "./constructorFindDir";

beforeEach(() => {
	vi.resetAllMocks();
	clearDirs();
	clearRoots();
	clearGlobalConfig();
	clearDirnames();
});

describe("constructorFindDir", () => {
	it("returns default path when no root is found", () => {
		// Arrange// Act// Assert
		setDirs({ [DIRS.DIR]: "/default-dir" });
		setDirnames({
			components: "/my-root/components",
		});

		const findDirFactory = constructorFindDir();

		// Arrange// Act// Assert
		const findDir = findDirFactory();
		const result = findDir("subfolder");

		// Arrange// Act// Assert
		expect(result).toBe(path.join("/default-dir", "subfolder"));
	});

	it("returns configured path when root and config are present", () => {
		setDirnames({
			components: "/my-root/components",
		});

		setDirs({ [DIRS.DIR]: "/ignored-dir" });
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({
			configFile: "custom.json",
			dirnamesFile: "direnames",
			cliFolder: "cli",
		});

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory("components");
		const result = findDir("button");

		expect(result).toBe(path.join("/my-root/components", "button"));
	});

	it("falls back to default keys if config is partial", () => {
		setDirnames({});
		setRoots({ [ROOTS.ROOT]: "/my-root" });
		setGlobalConfig({});

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();
		const result = findDir(DIRS.DIR);

		expect(result).toBe(path.join("/my-root", CLI_FOLDER, DIRS.DIR));
	});

	it("uses fallback name when nameDir is undefined", () => {
		setDirs({ [DIRS.DIR]: "/default-dir" });

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory();

		const result = findDir("file.ts");

		expect(result).toBe(path.join("/default-dir", "file.ts"));
	});

	it("uses fallback name with bad name when nameDir is undefined", () => {
		setDirs({ [DIRS.DIR]: "/default-dir" });

		const findDirFactory = constructorFindDir();
		const findDir = findDirFactory("custom");

		const result = findDir("file.ts");

		expect(result).toBe(path.join("/default-dir", "file.ts"));
	});
});
