export class MatcherError extends Error {
	// biome-ignore lint/complexity/noBannedTypes: <fuck>
	constructor(message: string, excludeFromStack?: Function) {
		super(message);
		this.name = "MatcherError";

		if (Error.captureStackTrace && excludeFromStack) {
			Error.captureStackTrace(this, excludeFromStack);
		}
	}
}
