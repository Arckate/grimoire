import { render } from "ink";
import type { PromptFn } from "~/models";
import { Spinner } from "./components";

type SpinnerConfig = { text?: string };

export interface SpinnerInstance {
	stop: () => void;
}

export const spinnerPrompt: PromptFn<SpinnerConfig> = async ({
	config: { text },
	processTerm,
}): Promise<SpinnerInstance> => {
	const { unmount } = render(<Spinner text={text} />, {
		stdout: processTerm.stdout,
		patchConsole: false,
	});

	return { stop: unmount };
};
