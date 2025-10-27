import type {
	Constructors,
	FlowsConfig,
} from "@arckate/grimoire-core/models";
import { ctorGenExtract } from "~/src/handlers/gens/ctorGenExtract";
import { ctorFlow } from "../src/handlers/flows/ctorFlow";
import { ctorEdit } from "../src/handlers/flows/modifiers/ctorEdit/ctorEdit";
import { ctorFilter } from "../src/handlers/flows/modifiers/ctorFilter/ctorFilter";
import { ctorInput } from "../src/handlers/flows/modifiers/ctorInput";
import { ctorMultiChoice } from "../src/handlers/flows/modifiers/ctorMultiChoice";
import { ctorGen } from "../src/handlers/gens/ctorGen";
import { ctorGenInit } from "../src/handlers/gens/ctorGenInit";
import { ctorInit } from "../src/handlers/inits/ctorInit";
import { ctorPlan } from "../src/handlers/plans/ctorPlan";
import reactDefault from "./templates/default/starters/reactDefault";

const constructors = {
	gen: { constrFn: ctorGen, configKey: "generators" },
	genInit: { constrFn: ctorGenInit, configKey: "inits" },
	genExtract: { constrFn: ctorGenExtract, configKey: "extracts" },
	init: { constrFn: ctorInit, configKey: "inits" },
	plan: { constrFn: ctorPlan, configKey: "generators" },
	flow: { constrFn: ctorFlow, configKey: "flows" },
	input: { constrFn: ctorInput },
	multiChoice: { constrFn: ctorMultiChoice },
	filter: { constrFn: ctorFilter },
	edit: { constrFn: ctorEdit },
} satisfies Constructors;

const flows: FlowsConfig<typeof constructors> = {
	constructors,
	workflows: {
		reactDefault,
	},
};

export default flows;
