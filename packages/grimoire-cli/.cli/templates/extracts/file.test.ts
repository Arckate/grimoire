import { getGlobalConfig } from "@arckate/grimoire-core/config";
import { type Config, constructorNodePlop, render } from "@arckate/testing-cli";
import nodePlop from "node-plop";
import { beforeEach, describe, expect, it, vi } from "vitest";
import file from "./file";

describe("file extract", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should generate prompts and run copy with correct config", async () => {
		const copySpy = vi.fn().mockResolvedValue("targetFile.ts");

		const config: Config = {
			generators: {
				file: {
					generatorsFn: file,
					params: [
						{
							findDir: (p: string) => `source/${p}`,
						},
					],
				},
			},
			setup: {
				actions: {
					copy: copySpy,
				},
			},
			findFile: getGlobalConfig().findFile,
		};

		const { stdout, exitCode } = await render({
			argv: ["extract"],
			setup: async ({ program, processTerm }) => {
				program.command("extract").action(async () => {
					const plop = await nodePlop();
					const plopfile = constructorNodePlop(config);
					await plopfile(plop);
					const generator = plop.getGenerator("file");

					// simulate prompt answers
					const { prompts } = generator;
					const srcPrompt = (prompts as any).find(
						(p: any) => p.name === "srcName",
					);
					const destPrompt = (prompts as any).find(
						(p: any) => p.name === "destName",
					);

					expect(srcPrompt?.message).toBe("What's the source file name?");
					expect(destPrompt?.message).toBe("What's the destination file name?");

					const { changes, failures } = await generator.runActions({
						srcName: "base.ts",
						destName: "target.ts",
					});

					changes.forEach(({ type, path }) => {
						process.stdout.write(`✔ [${type}] ${path}\n`);
					});
					failures.forEach(({ type, error }) => {
						process.stdout.write(`✖ [${type}] ${error}\n`);
					});
					processTerm.exit(0);
				});
			},
		});

		expect(copySpy).toHaveBeenCalled();
		expect(copySpy.mock.calls[0][1]).toEqual(
			expect.objectContaining({
				src: "source/{{srcName}}",
				dest: "{{destName}}",
			}),
		);

		const resultCmd = stdout.getInLast("✔ [copy] targetFile.ts");
		expect(resultCmd).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
