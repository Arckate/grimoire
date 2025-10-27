import { getGlobalConfig } from "@arckate/grimoire-core/config";
import { type Config, constructorNodePlop, render } from "@arckate/testing-cli";
import nodePlop from "node-plop";
import { beforeEach, describe, expect, it, vi } from "vitest";
import folder from "./folder";

describe("folder extract", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should generate prompts and run copyFolder with correct config", async () => {
		const copyFolderSpy = vi.fn().mockResolvedValue("destFolder");

		const config: Config = {
			generators: {
				folder: {
					generatorsFn: folder,
					params: [
						{
							findDir: (p: string) => `source/${p}`,
						},
					],
				},
			},
			setup: {
				actions: {
					copyFolder: copyFolderSpy,
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
					const generator = plop.getGenerator("folder");

					// simulate prompt answers
					const { prompts } = generator;
					const srcPrompt = (prompts as any).find(
						(p: any) => p.name === "srcName",
					);
					const destPrompt = (prompts as any).find(
						(p: any) => p.name === "destName",
					);

					expect(srcPrompt?.message).toBe("What's the source folder name?");
					expect(destPrompt?.message).toBe(
						"What's the destination folder name?",
					);

					const { changes, failures } = await generator.runActions({
						srcName: "base",
						destName: "target",
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

		expect(copyFolderSpy).toHaveBeenCalled();
		expect(copyFolderSpy.mock.calls[0][1]).toEqual(
			expect.objectContaining({
				src: "source/{{srcName}}",
				dest: "{{destName}}",
			}),
		);

		const resultCmd = stdout.getInLast("✔ [copyFolder] destFolder");
		expect(resultCmd).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
