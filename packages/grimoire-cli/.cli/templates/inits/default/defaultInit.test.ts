import { getGlobalConfig } from "@arckate/grimoire-core/config";
import { type Config, constructorNodePlop, render } from "@arckate/testing-cli";
import nodePlop from "node-plop";
import { beforeEach, describe, expect, it, vi } from "vitest";
import defaultInit from "./defaultInit";

describe("defaultInit", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should generate prompts and run actions with correct config", async () => {
		const copyToSpy = vi.fn().mockResolvedValue("config.cli");
		const addFolderSpy = vi.fn().mockResolvedValue(".cli");

		const config: Config = {
			generators: {
				defaultInit: {
					generatorsFn: defaultInit,
					params: [
						{
							findDir: (p: string) => p,
							config: {
								configFile: "config.cli",
								cliFolder: ".cli",
								findFile: {
									json: ["camelCase", "snakeCase"],
									yaml: ["flat"],
								},
							},
						},
					],
				},
			},
			setup: {
				actions: {
					copyTo: copyToSpy,
					addFolder: addFolderSpy,
				},
			},
			findFile: getGlobalConfig().findFile,
		};

		const { stdout, exitCode } = await render({
			argv: ["init"],
			setup: async ({ program, processTerm }) => {
				program.command("init").action(async () => {
					const plop = await nodePlop();
					const plopfile = constructorNodePlop(config);
					await plopfile(plop);
					const generator = plop.getGenerator("defaultInit");

					// simulate prompt answers
					const { prompts } = generator;
					const extPrompt = (prompts as any).find((p: any) => p.name === "ext");

					expect(extPrompt?.choices).toEqual([
						{ name: "json", value: "json" },
						{ name: "yaml", value: "yaml" },
					]);

					const { changes, failures } = await generator.runActions({
						ext: "json",
						type: "camelCase",
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

		expect(copyToSpy).toHaveBeenCalled();
		expect(copyToSpy.mock.calls[0][1]).toEqual(
			expect.objectContaining({
				src: "templates/defaultInit/config.cli.json",
				nameFileTo: "config.cli",
				typeFileFrom: "camelCase",
				typeFileTo: "{{type}}",
				extFileTo: "{{ext}}",
			}),
		);

		expect(addFolderSpy).toHaveBeenCalled();
		expect(addFolderSpy.mock.calls[0][1]).toEqual(
			expect.objectContaining({
				dest: ".cli",
			}),
		);

		const resultCopyTo = stdout.getInLast("✔ [copyTo] config.cli");
		expect(resultCopyTo).toBeInTerm();
		const resultAddFolder = stdout.getInLast("✔ [addFolder] .cli");
		expect(resultAddFolder).toBeInTerm();
		expect(exitCode).toBe(0);
	});
});
