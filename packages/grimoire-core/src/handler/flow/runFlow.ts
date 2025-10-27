import type { Cli } from "~/Cli";
import type {
	ConstructorContext,
	ConstructorFn,
	FlowsConfig,
	Workflow,
	WorkflowStep,
	RunCtor,
} from "~/models";
import { formatArgs } from "../formatArgs";
import { findWorkflow } from "./findWorkflow";

interface RunFlowParams {
	cli: Cli;
	args: string[] | [string, Record<string, string>];
	flowsConfig: FlowsConfig;
	force?: boolean;
	dest?: string;
	nameSpace?: string;
	filters?: Record<string, string>;
}

export const runFlow = async ({
	cli,
	args: [workflowName, ...newArgs],
	flowsConfig,
	force = false,
	dest: newDest,
	nameSpace = "",
	filters = {},
}: RunFlowParams): Promise<boolean> => {
	const processTerm = cli.getProcessTerm();
	const dest = newDest || processTerm.cwd();
	const formattedArgs = formatArgs(newArgs);

	const workflow = await findWorkflow({
		cli,
		workflows: flowsConfig.workflows as Record<string, Workflow>,
		workflowName,
	});

	const context: ConstructorContext = {
		cli,
		args: formattedArgs,
		force,
		dest,
		nameSpace,
		filters,
		flowsConfig,
	};

	const steps = Object.values(workflow) as WorkflowStep[];

	const runCtor = async ({ steps, ctx }: RunCtor) => {
		for (const { ctorKey: key, ...params } of steps) {
			const ctor = flowsConfig.constructors[key];
			if (!ctor) {
				throw new Error(`Constructor "${key}" not found in flowsConfig.`);
			}

			const result = await (
				ctor.constrFn as ConstructorFn<Record<string, unknown>>
			)(ctor.configKey ?? "", params, ctx);
			if (result) {
				return runCtor(result);
			}
		}
	};
	await runCtor({ steps, ctx: context });

	return true;
};
