import type { Cli } from "~/Cli";
import type { Workflow } from "~/models";

interface FindWorkflowParams {
	cli: Cli;
	workflows: Record<string, Workflow>;
	workflowName?: string;
}

export const findWorkflow = async ({
	cli,
	workflows,
	workflowName,
}: FindWorkflowParams): Promise<Workflow> => {
	const processTerm = cli.getProcessTerm();
	const { cliWorkflowName, cliRemoveLine } = cli.getPrompts();
	if (workflowName && workflows[workflowName]) {
		return workflows[workflowName];
	}
	const result = await cliWorkflowName({
		message: "Please choose a workflow",
		keyValue: "workflow",
		config: { isValid: false, list: Object.keys(workflows) },
		defaultValue: workflowName,
		processTerm,
	});
	cliRemoveLine({ message: "", keyValue: "", config: { nb: 1 }, processTerm });
	return workflows[result.workflow];
};
