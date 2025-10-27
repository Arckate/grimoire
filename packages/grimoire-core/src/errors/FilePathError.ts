export class FilePathError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FilePath";
	}
}
