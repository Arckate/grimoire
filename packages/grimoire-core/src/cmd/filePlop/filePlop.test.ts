import { formatError, render } from "@arckate/testing-cli";
import chalk from "chalk";
import { describe, expect, it, vi } from "vitest";
import type { GenObject } from "~/entities/GenObject";
import * as pathModule from "~/path/pathConstructor";
import * as readGenFileModule from "~/utils/readGenFile";
import { filePlop } from "./filePlop";

const MockRunActions = vi.fn();
const MockSetDefaultInclude = vi.fn();

vi.mock("node-plop", () => {
	return {
		default: () => ({
			getGenerator: () => ({ runActions: () => MockRunActions() }),
			setDefaultInclude: (params: any) => MockSetDefaultInclude(params),
		}),
	};
});

const genObject: GenObject = {
	genName: "my-generator",
	genId: "001",
	genMeta: {},
	genDest: "./generated",
	foo: "bar",
};

describe("filePlop", () => {
	it("should throw if args is not a GenObject", async () => {
		// Arrange/Act
		vi.spyOn(readGenFileModule, "readGenFile").mockReturnValue({} as any);
		const { exitCode, stderr } = await render({
			argv: ["plop"],
			setup: ({ program, processTerm }) => {
				program.command("plop").action(async () => {
					try {
						await filePlop({
							args: { foo: "bar" } as any,
							configPath: "./plopfile.js",
							processTerm,
							parentConfig: null,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		expect(exitCode).toBe(1);
		const error = stderr.getInLast("Only '.gen.json' files are allowed.");
		expect(error).toBeInTerm();
	});

	it("should throw if args is an array of GenObject", async () => {
		// Arrange/Act
		const { exitCode, stderr } = await render({
			argv: ["plop"],
			setup: ({ program, processTerm }) => {
				program.command("plop").action(async () => {
					try {
						await filePlop({
							args: [genObject] as any,
							configPath: "./plopfile.js",
							processTerm,
							parentConfig: null,
						});
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		expect(exitCode).toBe(1);
		const error = stderr.getInLast("Only one '.gen.json' files are allowed.");
		expect(error).toBeInTerm();
	});

	it("should read JSON if args is a string", async () => {
		// Arrange/Act
		vi.spyOn(readGenFileModule, "readGenFile").mockReturnValue(genObject);
		vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("./final-dest");
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const { stdout, exitCode } = await render({
			argv: ["plop"],
			setup: ({ program, processTerm }) => {
				program.command("plop").action(async () => {
					try {
						const result = await filePlop({
							args: "path/to/gen.json",
							configPath: "./plopfile.js",
							processTerm,
							parentConfig: null,
						});
						processTerm.stdout.write(`DEST: ${result.dest}\n`);
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		const result = stdout.getInLast("DEST: ./final-dest");
		expect(result).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should run generator and log changes and failures", async () => {
		// Arrange/Act
		vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("./final-dest");
		MockRunActions.mockReturnValue({
			changes: [{ type: "add", path: "src/index.ts" }],
			failures: [{ type: "error", error: "Oops!" }],
		});

		const { stdout, exitCode } = await render({
			argv: ["plop"],
			setup: ({ program, processTerm }) => {
				program.command("plop").action(async () => {
					try {
						const result = await filePlop({
							args: genObject,
							configPath: "./plopfile.js",
							processTerm,
							parentConfig: null,
						});
						processTerm.stdout.write(`DEST: ${result.dest}\n`);
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		const resultCmd = stdout.getInLast("You use generator my-generator");
		expect(resultCmd).toBeInTerm();
		const resultValid = stdout.getInLast(
			`${chalk.green("✔")} ${chalk.blueBright.bold.italic(`[add]`)} src/index.ts`,
		);
		expect(resultValid).toBeInTerm();
		const resultError = stdout.getInLast(
			`${chalk.red("✖")} ${chalk.blueBright.bold.italic(`[error]`)} Oops!`,
		);
		expect(resultError).toBeInTerm();
		const result = stdout.getInLast("DEST: ./final-dest");
		expect(result).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should fallback to oldDest if genDest is empty", async () => {
		// Arrange/Act
		const minimalGen: GenObject = {
			genName: "simple",
			genId: "002",
			genMeta: {},
			foo: "bar",
		};

		vi.spyOn(pathModule, "pathConstructor").mockImplementation(
			(_genDest, oldDest) => {
				return Promise.resolve(oldDest); // simulate fallback
			},
		);

		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const { stdout, exitCode } = await render({
			argv: ["plop"],
			setup: ({ program, processTerm }) => {
				program.command("plop").action(async () => {
					try {
						const result = await filePlop({
							args: minimalGen,
							configPath: "./plopfile.js",
							oldDest: "/fallback",
							processTerm,
							parentConfig: null,
						});
						processTerm.stdout.write(`DEST: ${result.dest}\n`);
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		const result = stdout.getInLast("DEST: /fallback");
		expect(result).toBeInTerm();
		expect(exitCode).toBe(0);
	});

	it("should preserve genFileName when already present in GenObject", async () => {
		// Arrange
		const genObjectWithFileName: GenObject = {
			genName: "my-generator",
			genDest: "./generated",
			genFileName: "explicit-name",
			foo: "bar",
		} as any;

		vi.spyOn(readGenFileModule, "readGenFile").mockReturnValue(
			genObjectWithFileName,
		);
		vi.spyOn(pathModule, "pathConstructor").mockResolvedValue("./final-dest");
		MockRunActions.mockReturnValue({ changes: [], failures: [] });

		const { stdout, exitCode } = await render({
			argv: ["plop"],
			setup: ({ program, processTerm }) => {
				program.command("plop").action(async () => {
					try {
						const result = await filePlop({
							args: "path/to/gen.json",
							configPath: "./plopfile.js",
							processTerm,
							parentConfig: null,
							oldGenFileName: "fallback-name",
						});
						processTerm.stdout.write(`GEN_FILE: ${result.genFileName}\n`);
						processTerm.exit(0);
					} catch (err) {
						const { message } = formatError(err);
						processTerm.stderr.write(`${message}\n`);
						processTerm.exit(1);
					}
				});
			},
		});

		// Assert
		const result = stdout.getInLast("GEN_FILE: explicit-name");
		expect(result).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
