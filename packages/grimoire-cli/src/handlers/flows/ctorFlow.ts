import { CONF_FLOWS } from "@arckate/grimoire-core/const";
import { runFlow } from "@arckate/grimoire-core/handler";
import type {
	ConstructorContext,
	ConstructorFn,
	FlowsConfig,
} from "@arckate/grimoire-core/models";
import { pathConstructor } from "@arckate/grimoire-core/path";

interface CtorFlowParams {
	workflowName: string;
	force?: boolean;
	params?: Record<string, string>;
	nameSpace?: string;
}

export const ctorFlow: ConstructorFn<CtorFlowParams> = async (
	configKey,
	{ force, workflowName, params, nameSpace },
	{ cli, filters, dest: newDest, force: forceGlobal }: ConstructorContext,
) => {
	const dest = await pathConstructor(cli, newDest);
	await runFlow({
		cli,
		args: [workflowName, params || {}],
		flowsConfig: cli.getConfCmd<FlowsConfig>(configKey || CONF_FLOWS).config,
		force: force || forceGlobal,
		dest,
		nameSpace,
		filters,
	});
};
