import { render } from "ink";
import type { PromptFn } from "~/models";
import { LogMessage, LogMessageError } from "./components";

type LoggerConfig = { args: (string | object)[] };
type LoggerErrorConfig = { error: Error };

export const loggerPrompt: PromptFn<LoggerConfig> = async ({
	config: { args },
	processTerm,
}): Promise<void> => {
	const { unmount } = render(<LogMessage args={args} />, {
		stdout: processTerm.stdout,
		patchConsole: false,
	});
	unmount();
};

export const loggerErrorPrompt: PromptFn<LoggerErrorConfig> = async ({
	config: { error },
	processTerm,
}): Promise<void> => {
	const { unmount } = render(<LogMessageError error={error} />, {
		stdout: processTerm.stdout,
		patchConsole: false,
	});
	unmount();
};
