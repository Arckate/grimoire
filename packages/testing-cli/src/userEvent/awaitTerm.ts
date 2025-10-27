import type EventEmitter from "node:events";
import { getEventBus } from "../eventBus";
import { getDelay } from "../renderContext";

export const awaitTermStopWrite = (seed: string) =>
	new Promise<void>((resolve) => {
		const eventBus = getEventBus(seed);
		let finishTimeout: NodeJS.Timeout | null = null;
		let actionSend: boolean = false;
		const finish = () => {
			if (finishTimeout) clearTimeout(finishTimeout);
			finishTimeout = setTimeout(() => {
				actionSend = true;
				resolve();
			}, 10);
		};
		eventBus?.on("action", () => {
			if (!actionSend) {
				finish();
			}
		});
		finish();
	});

interface AwaitTermIfMatchParams<T> {
	seed: string;
	keyBus: string;
	matcher: (params: T) => boolean;
	timeout: number;
}

export const awaitTermIfMatch = <T>({
	seed,
	keyBus,
	matcher,
	timeout,
}: AwaitTermIfMatchParams<T>) =>
	new Promise<void>((resolve) => {
		const delay = getDelay(seed);
		const eventBus = getEventBus(seed);
		let isFinish: boolean = false;
		let finishTimeout: NodeJS.Timeout | null = null;
		let countWait: number = 0;

		const finish = (value: T | null, innerEventBus: EventEmitter) => {
			if (finishTimeout) clearTimeout(finishTimeout);
			if (matcher(value) || countWait >= timeout) {
				isFinish = true;
				resolve();
			}
			innerEventBus?.emit("wait", 1000);
			finishTimeout = setTimeout(() => {
				innerEventBus.emit(`Get${keyBus}`);
			}, delay - 10);
			countWait += delay - 10;
		};
		if (!finishTimeout) finish(null, eventBus);
		eventBus?.on(keyBus, (params: T) => {
			if (!isFinish) {
				finish(params, eventBus);
			}
		});
	});
