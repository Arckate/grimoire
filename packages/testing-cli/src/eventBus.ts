import { EventEmitter } from "node:events";

interface EventBus {
	[x: string]: EventEmitter;
}
const eventBus: EventBus = {};

export const createEventBus = (seed: string): void => {
	const emitter = new EventEmitter();
	emitter.setMaxListeners(500);
	eventBus[seed] = emitter;
};

export const getEventBus = (seed: string): EventEmitter => eventBus[seed];

export const cleanEventBus = (seed: string): void => {
	delete eventBus[seed];
};
