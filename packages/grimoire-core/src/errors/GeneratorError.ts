export class GeneratorError extends Error {
	public children: Error | null;
	constructor(message: string, children: Error | null = null) {
		super(message);
		this.name = "EngineError";
		this.children = children;
	}
}
