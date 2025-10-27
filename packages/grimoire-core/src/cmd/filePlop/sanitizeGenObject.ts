import type { GenObject } from "~/entities/GenObject";

type SanitizeGenObject =
	| {
			isGenObject: true;
			isArrays: false;
			args: GenObject;
	  }
	| {
			isGenObject: true;
			isArrays: true;
			args: GenObject[];
	  }
	| {
			isGenObject: false;
			isArrays: false;
			args: any;
	  };

export const sanitizeGenObject = (args: any): SanitizeGenObject => {
	if (Array.isArray(args) && args[0] && "genName" in args[0]) {
		return {
			isGenObject: true,
			isArrays: true,
			args,
		};
	}

	if (typeof args === "object" && "genName" in args) {
		return {
			isGenObject: true,
			isArrays: false,
			args,
		};
	}

	return {
		isGenObject: false,
		isArrays: false,
		args,
	};
};
