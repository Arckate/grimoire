import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearDirs } from "~/config/dirs";
import { clearGlobalConfig } from "~/config/global";
import { clearRoots, setRoots } from "~/config/roots";
import { ROOTS } from "~/const/roots";
import type { GenObject } from "~/entities/GenObject";
import * as readConfigCliFileModule from "~/utils/readConfigCliFile";
import * as readGenFileModule from "~/utils/readGenFile";
import * as generatorsModule from "../generators";
import { deepFilePlop } from "./deepFilePlop";
import * as filePlopModule from "./filePlop";

const genObject: GenObject = {
	genName: "my-generator",
	genId: "001",
	genMeta: {},
	genDest: "./generated",
	foo: "bar",
};

beforeEach(() => {
	vi.resetAllMocks();
	clearRoots();
	clearGlobalConfig();
	clearDirs();
});

describe("deepFilePlop", () => {
	const processTerm = {
		stdin: process.stdin,
		stderr: process.stderr,
		stdout: process.stdout,
		exit: process.exit,
	};
	it("should run filePlop once and return true", async () => {
		// Arrange/Act
		setRoots({ [ROOTS.PARENT]: "/project" });

		vi.spyOn(generatorsModule, "findGenerators").mockResolvedValue({
			subGenConf: true,
		} as any);
		vi.spyOn(filePlopModule, "filePlop").mockResolvedValue({
			argsList: [],
			dest: "./final",
			genFileName: "",
		});

		const result = await deepFilePlop({
			argsList: [genObject],
			configPath: "./plopfile.js",
			generatorsConfig: {},
			processTerm,
			parentConfig: null,
		});

		// Assert
		expect(result).toBe(true);
	});

	it("should re-fetch generators if parent mismatch and subGenConf is false", async () => {
		// Arrange/Act
		vi.spyOn(readGenFileModule, "readGenFile").mockReturnValue(genObject);
		vi.spyOn(readConfigCliFileModule, "readConfigCliFile").mockReturnValue({
			typeGen: "react",
		});
		setRoots({ [ROOTS.PARENT]: "/parent" });

		vi.spyOn(generatorsModule, "findGenerators")
			.mockResolvedValueOnce({ subGenConf: false } as any)
			.mockResolvedValueOnce({ subGenConf: false } as any);

		vi.spyOn(filePlopModule, "filePlop").mockResolvedValue({
			argsList: [],
			dest: "./final",
			genFileName: "",
		});

		const result = await deepFilePlop({
			argsList: [genObject],
			configPath: "./plopfile.js",
			dest: "/outside",
			generatorsConfig: {},
			processTerm,
			parentConfig: null,
		});

		// Assert
		expect(result).toBe(true);
	});

	it("should recursively call deepFilePlop with child argsList", async () => {
		// Arrange/Act
		setRoots({ [ROOTS.PARENT]: "/project" });

		const filePlopMock = vi
			.spyOn(filePlopModule, "filePlop")
			.mockResolvedValueOnce({
				argsList: [
					{
						genName: "child-generator",
						genId: "002",
						genMeta: {},
						foo: "baz",
					},
				],
				dest: "./child",
				genFileName: "",
			})
			.mockResolvedValueOnce({
				argsList: [],
				dest: "./child",
				genFileName: "",
			});

		vi.spyOn(generatorsModule, "findGenerators").mockResolvedValue({
			subGenConf: true,
		} as any);

		const result = await deepFilePlop({
			argsList: [genObject],
			configPath: "./plopfile.js",
			generatorsConfig: {},
			processTerm,
			parentConfig: null,
		});

		// Assert
		expect(filePlopMock).toHaveBeenCalledTimes(2);
		expect(result).toBe(true);
	});

	it("should return true immediately if argsList is empty", async () => {
		// Arrange/Act
		const result = await deepFilePlop({
			argsList: [],
			configPath: "./plopfile.js",
			generatorsConfig: {},
			processTerm,
			parentConfig: null,
		});

		// Assert
		expect(result).toBe(true);
	});
});
