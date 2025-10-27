import { createEventBus, getEventBus } from "../eventBus";
import { cleanAnsi } from "../utils/cleanAnsi";
import { escapeRegex } from "../utils/escapeRegex";
import { awaitTermIfMatch, awaitTermStopWrite } from "./awaitTerm";
import { sendWhenThermStart } from "./sendWhenThermStart";
import {
	getCount,
	getCurrentId,
	getUserEventContext,
	setCount,
	setCurrentId,
	setUserEventContext,
} from "./userEventContext";

export function userEvent() {
	const seed = crypto.randomUUID();
	createEventBus(seed);
	setUserEventContext(seed);

	return {
		type: (text: string) => {
			const count = getCount(seed);
			const id = count + 1;
			setCount(seed, id);
			const actionFn = async () => {
				const { currentId, stdin } = getUserEventContext(seed);
				const eventBus = getEventBus(seed);
				await awaitTermStopWrite(seed);
				eventBus?.emit("captureTerm");
				stdin.send(text);
				setCurrentId(seed, currentId + 1);
				eventBus?.emit("next");
			};
			sendWhenThermStart({ seed, id, actionFn });
		},
		pressEnter: () => {
			const count = getCount(seed);
			const id = count + 1;
			setCount(seed, id);
			const actionFn = async () => {
				const { currentId, stdin } = getUserEventContext(seed);
				const eventBus = getEventBus(seed);
				await awaitTermStopWrite(seed);
				eventBus?.emit("captureTerm");
				stdin.send("\n");
				setCurrentId(seed, currentId + 1);
				eventBus?.emit("next");
			};
			sendWhenThermStart({ seed, id, actionFn });
		},
		arrowDown: () => {
			const count = getCount(seed);
			const id = count + 1;
			setCount(seed, id);
			const actionFn = async () => {
				const { currentId, stdin } = getUserEventContext(seed);
				const eventBus = getEventBus(seed);
				await awaitTermStopWrite(seed);
				eventBus?.emit("captureTerm");
				stdin.send("\u001b[B");
				setCurrentId(seed, currentId + 1);
				eventBus?.emit("next");
			};
			sendWhenThermStart({ seed, id, actionFn });
		},
		end: () => {
			const count = getCount(seed);
			const id = count + 1;
			setCount(seed, id);
			const actionFn = async () => {
				const { currentId, stdin } = getUserEventContext(seed);
				const eventBus = getEventBus(seed);
				await awaitTermStopWrite(seed);
				eventBus?.emit("captureTerm");
				stdin.end();
				setCurrentId(seed, currentId + 1);
				eventBus?.emit("next");
			};
			sendWhenThermStart({ seed, id, actionFn });
		},

		waitWrite: (expected: string | RegExp, timeout: number = 1000) => {
			const count = getCount(seed);
			const id = count + 1;
			setCount(seed, id);
			const actionFn = async () => {
				const currentId = getCurrentId(seed);
				const eventBus = getEventBus(seed);
				await awaitTermStopWrite(seed);
				await awaitTermIfMatch<string>({
					keyBus: "FakeTerminal",
					timeout,
					seed,
					matcher: (line: string) => {
						if (line) {
							const cleanedLine = cleanAnsi(line, expected);
							const pattern =
								expected instanceof RegExp
									? new RegExp(`.*(${expected.source}).*`, expected.flags)
									: new RegExp(`.*(${escapeRegex(expected)}).*`, "g");
							return pattern.test(cleanedLine);
						}
						return false;
					},
				});
				eventBus?.emit("captureTerm");
				await awaitTermStopWrite(seed);
				setCurrentId(seed, currentId + 1);
				eventBus?.emit("wait");
				eventBus?.emit("next");
			};
			sendWhenThermStart({ seed, id, actionFn });
		},

		waitExit: (expected: number, timeout: number = 1000) => {
			const count = getCount(seed);
			const id = count + 1;
			setCount(seed, id);
			const actionFn = async () => {
				const currentId = getCurrentId(seed);
				const eventBus = getEventBus(seed);
				await awaitTermStopWrite(seed);
				await awaitTermIfMatch<number>({
					keyBus: "ExitCode",
					seed,
					timeout,
					matcher: (exitCode: number) => expected === exitCode,
				});
				eventBus?.emit("captureTerm");
				await awaitTermStopWrite(seed);
				setCurrentId(seed, currentId + 1);
				eventBus?.emit("wait");
				eventBus?.emit("next");
			};
			sendWhenThermStart({ seed, id, actionFn });
		},
		getSeed: () => seed,
	};
}
