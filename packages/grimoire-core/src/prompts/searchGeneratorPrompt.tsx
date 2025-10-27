import { render } from "ink";
import type { PromptFn } from "~/models";
import { Search } from "./components";

type GeneratorListInfo = {
	name: string;
	description: string;
};

type SearchGeneratorConfig = {
	isValid: boolean;
	list: GeneratorListInfo[];
};

export const searchGeneratorPrompt: PromptFn<SearchGeneratorConfig> = async ({
	config: { isValid, list },
	processTerm,
	keyValue,
	message,
	defaultValue,
}): Promise<{ [x: string]: string }> => {
	const mappedList = list.map(({ name, description }) => ({
		label: name,
		value: name,
		description,
	}));

	let unmountSearch!: () => void;
	const searchResult = await new Promise<string>((resolve) => {
		const { unmount } = render(
			<Search
				message={message}
				list={mappedList}
				onSubmit={(value) => {
					resolve(value);
				}}
				isValidSelectedValue={isValid}
				selectedValue={defaultValue}
				invalid={{
					icon: "⚠",
					prefix: "Generator ",
					suffix: " isn't in the list",
					message: "Please choose a valid generator ",
				}}
				down={{
					icon: "✦",
					prefix: "You use generator ",
				}}
				isExited
			/>,
			{
				stdout: processTerm.stdout,
				stdin: processTerm.stdin,
				interactive: true,
				patchConsole: false,
			},
		);
		unmountSearch = unmount;
	});
	unmountSearch();

	return Promise.resolve({ [keyValue]: searchResult });
};
