import { render } from "ink";
import type { PromptFn } from "~/models";
import type { PromptResultItem } from "./components";
import { Results } from "./components";

type ResultConfig = { items: PromptResultItem[] };

export const resultPrompt: PromptFn<ResultConfig> = async ({
	config: { items },
	processTerm,
}): Promise<void> => {
	const { unmount } = render(<Results items={items} />, {
		stdout: processTerm.stdout,
		patchConsole: false,
	});
	unmount();
};
