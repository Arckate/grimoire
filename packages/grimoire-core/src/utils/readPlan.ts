import type { Cli } from "~/Cli";
import { PLAN_EXT, PLAN_TYPE } from "~/const";
import type { Plan, RecordCamelCase } from "~/models";

export const readPlan = (
	cli: Cli,
	path: string,
	parentConfig: RecordCamelCase<string, string> | null,
): Plan => {
	const config = cli.getConfig();
	const ext = parentConfig?.planExt || config.planExt || PLAN_EXT;
	const type = parentConfig?.planType || config.planType || PLAN_TYPE;
	const processor = config.processor || {};

	if (processor?.[ext]?.[type]) {
		return processor[ext][type].read(path) as Plan;
	}
	throw new Error(`Find files ${ext} ${type} read function doesn't exist`);
};
