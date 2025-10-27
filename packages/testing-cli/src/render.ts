import chalk from "chalk";
import { Command } from "commander";
import type { ProcessTerm } from "./entities/ProcessTerm";
import { cleanEventBus, createEventBus, getEventBus } from "./eventBus";
import { FakeTerminal } from "./FakeTerminal";
import { cleanRenderContext, createRenderContext } from "./renderContext";
import { constructorTerm } from "./term/term";
import { getCount, getCurrentId, getStdin, type userEvent } from "./userEvent";
import { cleanUserEventContext } from "./userEvent/userEventContext";
import { formatError } from "./utils/formatError";
import {
	debugCommandTest,
	debugTermTest,
	loggerTest,
} from "./utils/loggerTest";

export function countRemoveSequences(input: string): number {
	const pattern = /\u001b\[1A\u001b\[2K/g;
	const matches = input.match(pattern);
	return matches ? matches.length : 0;
}

chalk.level = 3;

type Term = {
	term: string[];
} & ReturnType<typeof constructorTerm>;
interface Render {
	stdout: Term;
	stderr: Term;
	exitCode: number;
	debug: (value: string[], escapeAnsi?: boolean) => void;
	debugTerm: (escapeAnsi?: boolean) => void;
}

interface SetupParams {
	program: Command;
	user?: ReturnType<typeof userEvent>;
	debug: (params: { args: any[]; escapeAnsi?: boolean }) => void;
	processTerm: ProcessTerm;
}

interface RenderParams {
	argv: string[];
	setup: (params: SetupParams) => void;
	user?: ReturnType<typeof userEvent>;
	options?: {
		delay?: number;
		enableLogTerm?: boolean;
	};
}

export async function render({
	argv,
	setup,
	user,
	options: { delay = 100, enableLogTerm = false } = {
		delay: 100,
		enableLogTerm: false,
	},
}: RenderParams): Promise<Render> {
	const seed = user?.getSeed() || crypto.randomUUID();
	if (!user?.getSeed()) {
		createEventBus(seed);
	}
	const eventBus = getEventBus(seed);
	const stdout: string[] = [];
	const stderr: string[] = [];
	let exitCode = 990;

	const originalStdoutWrite = process.stdout.write.bind(process.stdout);
	const originalStderrWrite = process.stderr.write.bind(process.stderr);
	const originalStdin = process.stdin;
	const originalProcessExit = process.exit;
	createRenderContext(seed, { delay, stdout: originalStdoutWrite });

	const fakeTerminal = new FakeTerminal(enableLogTerm, seed);

	const stdoutWriteFn = ((chunk: any) => {
		fakeTerminal.write(chunk);
		return true;
	}) as typeof process.stdout.write;
	process.stdout.write = stdoutWriteFn;
	const mockStdout = process.stdout;
	mockStdout.write = stdoutWriteFn;

	const stderrWriteFn = ((chunk: any) => {
		const text = typeof chunk === "string" ? chunk : chunk.toString();
		const lines = text.split("\n").filter(Boolean);
		stderr.push(...lines);
		return true;
	}) as typeof process.stderr.write;
	process.stderr.write = stderrWriteFn;
	const mockStderr = process.stderr;
	mockStderr.write = stderrWriteFn;

	const exitFn = ((code?: number) => {
		exitCode = code ?? 999;
	}) as typeof process.exit;
	process.exit = exitFn;

	const stdin = getStdin(seed) as unknown as typeof process.stdin;
	Object.defineProperty(process, "stdin", {
		value: stdin,
		configurable: true,
		writable: false,
	});

	const finish = (): Render => {
		process.stdout.write = originalStdoutWrite;
		process.stderr.write = originalStderrWrite;
		Object.defineProperty(process, "stdin", {
			value: originalStdin,
			configurable: true,
			writable: true,
		});
		process.exit = originalProcessExit;
		cleanUserEventContext(seed);
		cleanRenderContext(seed);
		cleanEventBus(seed);

		stdout.push(`\n${fakeTerminal.getOutput().trim()}\n`);
		const finalStderr = [`\n${stderr.join("\n").trim()}\n`];

		return {
			stdout: {
				term: stdout,
				...constructorTerm(stdout),
			},
			stderr: {
				term: finalStderr,
				...constructorTerm(finalStderr),
			},
			exitCode,
			debug: debugCommandTest(originalStderrWrite),
			debugTerm: debugTermTest(originalStderrWrite, fakeTerminal.getLogger()),
		};
	};

	eventBus?.on("captureTerm", () => {
		stdout.push(`\n${fakeTerminal.getOutput().trim()}\n`);
	});

	eventBus?.on("GetFakeTerminal", () => {
		eventBus?.emit("FakeTerminal", `\n${fakeTerminal.getOutput().trim()}\n`);
	});

	eventBus?.on("GetExitCode", () => {
		eventBus?.emit("ExitCode", exitCode);
	});

	const processTerm = {
		stdin,
		stdout: mockStdout,
		stderr: mockStderr,
		exit: exitFn,
	};

	const program = new Command();
	program
		.exitOverride((err) => {
			return exitFn(err.exitCode);
		})
		.configureOutput({
			writeOut: (str) => processTerm.stdout.write(str),
			writeErr: (str) => processTerm.stderr.write(str),
			outputError: (str, write) => write(str),
		});

	try {
		setup({
			program,
			user,
			debug: ({ args, escapeAnsi = false }) => {
				loggerTest({ stoutWrite: originalStdoutWrite, escapeAnsi }, ...args);
			},
			processTerm,
		});
	} catch (err) {
		const { message } = formatError(err);
		debugCommandTest(originalStdoutWrite)([`setup error ${message}`]);
		stderr.push(`${message}`);
		exitCode = 999;
	}

	const stopIfToLong = (innerSeed: string) =>
		new Promise<Render>((resolve) => {
			const innerEventBus = getEventBus(innerSeed);
			let finishTimeout: NodeJS.Timeout | null = null;
			const defaultContext: { delay: number } = {
				delay,
			};
			let isFinish = false;

			const scheduleResult = (innerDelay: number) => {
				if (finishTimeout) clearTimeout(finishTimeout);
				debugCommandTest(originalStdoutWrite)([""]);
				const count = getCount(seed) ? getCount(seed) + 1 : 1;
				finishTimeout = setTimeout(
					() => {
						isFinish = true;
						resolve(finish());
					},
					(count + 1) * innerDelay,
				);
			};

			if (!finishTimeout) scheduleResult(defaultContext.delay);
			innerEventBus?.on("action", () => {
				if (!isFinish) {
					scheduleResult(defaultContext.delay);
				}
			});
			innerEventBus?.on("next", () => {
				if (!isFinish) {
					scheduleResult(defaultContext.delay);
				}
			});
			innerEventBus?.on("wait", (innerDelay: number) => {
				if (!isFinish) {
					defaultContext.delay = innerDelay | delay;
					scheduleResult(defaultContext.delay);
				}
			});
		});

	const waitFinishWrite = (innerSeed: string) =>
		new Promise<void>((resolve) => {
			if (!user?.getSeed()) {
				resolve();
			}

			const innerEventBus = getEventBus(innerSeed);
			let finishTimeout: NodeJS.Timeout | null = null;
			const defaultContext: { delay: number; waitDelay: number } = {
				delay: 10,
				waitDelay: 0,
			};
			let isFinish = false;

			const schedule = (
				context: { delay: number; waitDelay: number },
				currentSeed: string,
			) => {
				if (finishTimeout) clearTimeout(finishTimeout);
				const currentId = getCurrentId(currentSeed);
				const count = getCount(currentSeed);
				if (count !== 0 && currentId > count && context.waitDelay === 0) {
					isFinish = true;
					resolve();
				}
				finishTimeout = setTimeout(() => {
					schedule(context, currentSeed);
				}, context.delay);
			};

			if (!finishTimeout) schedule(defaultContext, innerSeed);
			innerEventBus?.on("wait", (innerDelay: number) => {
				if (!isFinish) {
					defaultContext.waitDelay = innerDelay | 0;
					schedule(defaultContext, innerSeed);
				}
			});
		});

	const parse = async () => {
		try {
			await program.parseAsync([...argv], { from: "user" });
		} catch (err) {
			const { message } = formatError(err);
			debugCommandTest(originalStdoutWrite)([`parse error ${message}`]);
			stderr.push(`Runtime error: ${message}`);
			exitCode = 998;
		}
	};

	const waitAllParse = async (innerSeed: string) => {
		await Promise.all([waitFinishWrite(innerSeed), parse()]);
		return finish();
	};

	return Promise.race([waitAllParse(seed), stopIfToLong(seed)]);
}
