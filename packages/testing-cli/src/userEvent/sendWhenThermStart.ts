import { getEventBus } from "../eventBus";
import { getCurrentId } from "./userEventContext";

interface sendWhenThermStartParams {
	id: number;
	seed: string;
	actionFn: () => Promise<void>;
}
export const sendWhenThermStart = ({
	id,
	seed,
	actionFn,
}: sendWhenThermStartParams) => {
	const eventBus = getEventBus(seed);

	let isStarted: boolean = false;
	eventBus?.on("start", async () => {
		const currentId = getCurrentId(seed);
		if (id === currentId && !isStarted) {
			isStarted = true;
			await actionFn();
		}
	});

	eventBus?.on("next", async () => {
		const currentId = getCurrentId(seed);
		if (id === currentId && !isStarted) {
			isStarted = true;
			await actionFn();
		}
	});
};
