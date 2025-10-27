import { ResultError } from "~/errors";
import type { IResult, ResultShape } from "./IResult";

interface ResultKOConstruct<TData> {
	where: string;
	error: ResultError<TData>;
}

export class ResultKO<TData extends Record<string, any>>
	implements IResult<any>
{
	private status = "KO" as const;
	private where: string;
	private error: ResultError<TData>;

	private constructor({ where, error }: ResultKOConstruct<TData>) {
		this.where = where;
		this.error = error;
	}

	public static init<T extends Record<string, any>>(
		where: string,
		message: string,
		data: T,
	): ResultKO<T> {
		return new ResultKO<T>({ where, error: new ResultError(message, data) });
	}

	public GetResult(): ResultShape<TData> {
		return {
			status: this.status,
			where: this.where,
			error: this.error,
		};
	}

	public Match<R>(
		_success: (data: TData) => R,
		error: (err: ResultError<TData>) => R,
	): R {
		return error(this.error);
	}

	public Then<TNew extends Record<string, any>>(
		_fn: (data: TData) => IResult<TNew>,
	): IResult<TNew> {
		return this as unknown as IResult<TNew>;
	}

	public async ThenAsync<TNew extends Record<string, any>>(
		_fn: (data: TData) => Promise<IResult<TNew>>,
	): Promise<IResult<TNew>> {
		return this as unknown as IResult<TNew>;
	}
}
