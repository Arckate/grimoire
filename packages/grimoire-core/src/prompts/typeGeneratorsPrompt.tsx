import { render } from "ink";
import type { PromptFn } from "~/models";
import { Search } from "./components";

type TypeGeneratorsConfig = {
	isValid: boolean;
	list: string[];
};

export const typeGeneratorsPrompt: PromptFn<TypeGeneratorsConfig> = async ({
	config: { isValid, list },
	processTerm,
	keyValue,
	message,
	defaultValue,
}): Promise<{ [x: string]: string }> => {
	const mappedList = list.map((item) => ({ label: item, value: item }));

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
					prefix: "Type Generator ",
					suffix: " isn't in the list",
					message: "Please choose a valid type of generator ",
				}}
				down={{
					icon: "✦",
					prefix: "You use type generator ",
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
