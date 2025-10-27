export class ResultError<TData extends Record<string, any>> extends Error {
	public data: TData;
	constructor(message: string, data: TData = {} as TData) {
		super(message);
		this.name = "ResultError";
		this.data = data;
	}
}
