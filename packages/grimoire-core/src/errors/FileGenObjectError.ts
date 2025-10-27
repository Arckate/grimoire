export class FileGenObjectError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FileGenObject";
	}
}
