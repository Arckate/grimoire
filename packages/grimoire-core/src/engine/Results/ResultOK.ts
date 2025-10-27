import type { ResultError } from "~/errors";
import type { IResult, ResultShape } from "./IResult";

interface ResultOKConstruct<TData> {
	where: string;
	data: TData;
}

export class ResultOK<TData extends Record<string, any>>
	implements IResult<TData>
{
	private status = "OK" as const;
	private where: string;
	private data: TData;

	private constructor({ where, data }: ResultOKConstruct<TData>) {
		this.where = where;
		this.data = data;
	}

	public static init<T extends Record<string, any>>(
		where: string,
		data: T,
	): ResultOK<T> {
		return new ResultOK<T>({ where, data });
	}

	public GetResult(): ResultShape<TData> {
		return { status: this.status, where: this.where, data: this.data };
	}

	public Match<R>(
		success: (data: TData) => R,
		_error: (err: ResultError<TData>) => R,
	): R {
		return success(this.data);
	}

	public Then<TNew extends Record<string, any>>(
		fn: (data: TData) => IResult<TNew>,
	): IResult<TNew> {
		return fn(this.data);
	}

	public async ThenAsync<TNew extends Record<string, any>>(
		fn: (data: TData) => Promise<IResult<TNew>>,
	): Promise<IResult<TNew>> {
		return fn(this.data);
	}
}
