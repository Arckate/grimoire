import { mergeReplaceObject } from "./mergeReplaceObject";

export type ArrayKey = (
	| "generator"
	| "initGenerator"
	| "in"
	| "question"
	| "keyFilter"
	| "starterName"
	| "inputQuestion"
	| "keys"
)[];
const everyKeyFalse = (value: any, arrayKey: ArrayKey): boolean => {
	return arrayKey.every((key) => !value[key]);
};

const oneofKeyTrue = (value: any, arrayKey: ArrayKey): boolean => {
	return !arrayKey.every((key) => !value[key]);
};

interface MergeObjectParams {
	key:
		| "generator"
		| "in"
		| "question"
		| "keyFilter"
		| "starterName"
		| "initGenerator"
		| "inputQuestion"
		| "keys";
	arrayKey: ArrayKey;
	objValue: any;
	srcValue: any;
}

export const mergeObject = ({
	key,
	arrayKey,
	objValue,
	srcValue,
}: MergeObjectParams): boolean => {
	if (
		objValue[key] &&
		everyKeyFalse(objValue, arrayKey) &&
		!srcValue[key] &&
		oneofKeyTrue(srcValue, arrayKey)
	) {
		mergeReplaceObject(objValue, srcValue);
		return true;
	}
	return false;
};
