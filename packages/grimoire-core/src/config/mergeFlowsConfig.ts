import merge from "lodash.merge";
import mergeWith from "lodash.mergewith";
import type { FlowsConfig, Workflow } from "~/models";

const hasCtorKey = (v: unknown): v is { ctorKey: string } =>
	v !== null &&
	typeof v === "object" &&
	"ctorKey" in v &&
	typeof (v as { ctorKey: unknown }).ctorKey === "string";

const mergeWorkflow = (
	oldWorkflow: Workflow,
	newWorkflow: Workflow,
): Workflow => {
	const customize = (objValue: unknown, srcValue: unknown): unknown => {
		if (
			hasCtorKey(objValue) &&
			hasCtorKey(srcValue) &&
			objValue.ctorKey !== srcValue.ctorKey
		) {
			return srcValue;
		}
	};

	return mergeWith({}, oldWorkflow, newWorkflow, customize) as Workflow;
};

export const mergeFlowsConfig = (
	oldValue: FlowsConfig,
	newValue: FlowsConfig,
): FlowsConfig => {
	const constructors = merge(oldValue.constructors, newValue.constructors);

	const workflows: Record<string, Workflow> = structuredClone(
		oldValue.workflows,
	);
	for (const [name, newWorkflow] of Object.entries(newValue.workflows)) {
		const oldWorkflow = oldValue.workflows[name];
		workflows[name] = oldWorkflow
			? mergeWorkflow(oldWorkflow, newWorkflow)
			: newWorkflow;
	}

	return { constructors, workflows };
};
