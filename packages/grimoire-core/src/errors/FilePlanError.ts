export class FilePlanError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FilePlan";
	}
}
