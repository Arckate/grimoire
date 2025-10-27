import type { Plan } from "~/models";

type SanitizePlan =
	| {
			isPlan: true;
			isArrays: false;
			args: Plan;
	  }
	| {
			isPlan: true;
			isArrays: true;
			args: Plan[];
	  }
	| {
			isPlan: false;
			isArrays: false;
			args: any;
	  };

export const sanitizePlan = (args: any): SanitizePlan => {
	if (Array.isArray(args) && args[0] && "genName" in args[0]) {
		return {
			isPlan: true,
			isArrays: true,
			args,
		};
	}

	if (typeof args === "object" && "genName" in args) {
		return {
			isPlan: true,
			isArrays: false,
			args,
		};
	}

	return {
		isPlan: false,
		isArrays: false,
		args,
	};
};
