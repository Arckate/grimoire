export const formatError = (error: any): Error => {
	if (error instanceof Error) {
		return error;
	}

	if (typeof error === "string") {
		return new Error(error);
	}

	return new Error("unknown");
};
