import merge from "lodash.merge";
import type {
	Generators,
	GeneratorsSubConfig,
	SubGenerators,
} from "~/models";

export type CheckHaveSubConf =
	| {
			isSubConf: true;
			value: SubGenerators;
	  }
	| {
			isSubConf: false;
			value: Generators;
	  };

const checkHaveSubConf = (value: GeneratorsSubConfig): CheckHaveSubConf => {
	if (!value.subGenConf) {
		return {
			isSubConf: false,
			value: value as Generators,
		};
	}
	return {
		isSubConf: true,
		value: value as SubGenerators,
	};
};

export const mergeGenerators = (
	oldValue: GeneratorsSubConfig,
	newValue: GeneratorsSubConfig,
): GeneratorsSubConfig => {
	const { isSubConf: isOldSubConf, value: oldValueChecked } =
		checkHaveSubConf(oldValue);
	const { isSubConf: isNewSubConf, value: newValueChecked } =
		checkHaveSubConf(newValue);
	let oldCurrentValue: GeneratorsSubConfig = oldValueChecked;
	let newCurrentValue: GeneratorsSubConfig = newValueChecked;

	if (!isOldSubConf && isNewSubConf) {
		oldCurrentValue = {
			subGenConf: true,
			default: {
				...oldValueChecked,
			} as Generators,
		};
	}

	if (!isNewSubConf && isOldSubConf) {
		newCurrentValue = {
			subGenConf: true,
			default: {
				...newValueChecked,
			} as Generators,
		};
	}

	return merge(oldCurrentValue, newCurrentValue);
};
