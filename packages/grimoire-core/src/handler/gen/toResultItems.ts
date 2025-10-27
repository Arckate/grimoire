import type { IResult } from "~/engine";
import type { PromptResultItem } from "~/prompts/components";

export const toResultItems = (resultValues: IResult<any>): {result : boolean, items: PromptResultItem[]} =>{
	let result= true
	const items = resultValues.Match(
		(data) => {
			const items: PromptResultItem[] = [];
			for (const r of Array.isArray(data) ? data : []) {
				const item: PromptResultItem = r.Match(
					(inner: any) => ({ isValid: true, data: inner }),
					(err: any) => ({ isValid: false, data: { message: err.message } }),
				);
				items.push(item);
				if (!item.isValid) {
					result = false;
					break;
				}
			}
			return items;
		},
		(err): PromptResultItem[] => {
			result = false
			return [{ isValid: false, data: { message: err.message } }]
		},
	);
	
	return  { result, items }
}
