type formatArgs =
	| {
			isArrayArgs: true;
			args: string[];
	  }
	| {
			isArrayArgs: false;
			args: Record<string, string>;
	  };

export const formatArgs = (
	args: (string | Record<string, string>)[],
): formatArgs => {
	if (!args.length || (args.length && typeof args[0] === "string")) {
		return {
			isArrayArgs: true,
			args: args as string[],
		};
	}
	return {
		isArrayArgs: false,
		args: args[0] as Record<string, string>,
	};
};
