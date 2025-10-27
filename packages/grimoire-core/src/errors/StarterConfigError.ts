export class StarterConfigError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "StarterConfig";
	}
}
