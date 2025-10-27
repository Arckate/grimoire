import type { ResultError } from "~/errors";

export type ResultShape<TData> =
	| { status: "OK"; where: string; data: TData }
	| { status: "KO"; where: string; error: ResultError<TData> };

export interface IResult<TData extends Record<string, any>> {
	GetResult(): ResultShape<TData>;
	Match<R>(
		success: (data: TData) => R,
		error: (err: ResultError<TData>) => R,
	): R;
	Then<TNew extends Record<string, any>>(
		fn: (data: TData) => IResult<TNew>,
	): IResult<TNew>;
	ThenAsync<TNew extends Record<string, any>>(
		fn: (data: TData) => Promise<IResult<TNew>>,
	): Promise<IResult<TNew>>;
}
