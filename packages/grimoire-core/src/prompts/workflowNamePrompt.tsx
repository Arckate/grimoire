import { render } from "ink";
import type { PromptFn } from "~/models";
import { Search } from "./components";

type WorkflowNameConfig = {
	isValid: boolean;
	list: string[];
};

export const workflowNamePrompt: PromptFn<WorkflowNameConfig> = async  ({
	config: { isValid, list },
	processTerm,
	keyValue,
	message,
	defaultValue,
}): Promise<{ [x:string]: string }> => {

	const mappedList = list.map((item) => ({ label: item, value: item }));

	let unmountSearch!: () => void;
	const searchResult = await new Promise<string>((resolve) => {
		const { unmount } = render(
			<Search
				message={ message && "Please choose a workflow" }
				list={mappedList}
				onSubmit={(value) => {
					resolve(value);
				}}
				isValidSelectedValue={isValid}
				selectedValue={defaultValue}
				invalid={{
					icon: "⚠",
					prefix: "Workflow",
					suffix: "isn't in the list",
					message: "Please choose a valid workflow",
				}}
				down={{
					icon: "✦",
					prefix: "You use workflow",
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

	return Promise.resolve({ [keyValue]: searchResult })
};
