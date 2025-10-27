import { ResultKO } from "./ResultKO";
import { ResultOK } from "./ResultOK";

// biome-ignore lint/complexity/noStaticOnlyClass: <Result pattern in POO>
export class Results {
	public static returnResponse<T extends Record<string, any>>(
		where: string,
		data: T,
	): ResultOK<T> {
		return ResultOK.init<T>(where, data);
	}
	public static returnError<T extends Record<string, any>>(
		where: string,
		message: string,
		data: T,
	): ResultKO<T> {
		return ResultKO.init<T>(where, message, data);
	}
}
