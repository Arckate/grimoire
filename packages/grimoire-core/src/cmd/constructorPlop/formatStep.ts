import { STARTER_TYPES } from "~/const/starters";
import type {
	CmdInitParams,
	CmdPlopParams,
	FilePlopParams,
	Filter,
	Input,
	MultiChoice,
	SetValues,
	StarterLink,
	StarterParams,
} from "~/entities/Starters";

type FormatStarter<_T> =
	| {
			type: STARTER_TYPES.CMD_PLOP;
			step: CmdPlopParams;
	  }
	| {
			type: STARTER_TYPES.FILE_PLOP;
			step: FilePlopParams;
	  }
	| {
			type: STARTER_TYPES.STARTER;
			step: StarterLink;
	  }
	| {
			type: STARTER_TYPES.MULTI_CHOICE;
			step: MultiChoice;
	  }
	| {
			type: STARTER_TYPES.INPUT;
			step: Input;
	  }
	| {
			type: STARTER_TYPES.FILTER;
			step: Filter<any>;
	  }
	| {
			type: STARTER_TYPES.INIT;
			step: CmdInitParams;
	  }
	| {
			type: STARTER_TYPES.SET_VALUES;
			step: SetValues<any>;
	  }
	| {
			type: STARTER_TYPES.UNKNOWN;
			step: Record<string, any>;
	  };

export const formatStep = <T>(
	step: StarterParams | Record<string, any>,
): FormatStarter<T> => {
	if (step["generator"]) {
		return {
			type: STARTER_TYPES.CMD_PLOP,
			step: step as CmdPlopParams,
		};
	}
	if (step["in"]) {
		return {
			type: STARTER_TYPES.FILE_PLOP,
			step: step as FilePlopParams,
		};
	}
	if (step["question"]) {
		return {
			type: STARTER_TYPES.MULTI_CHOICE,
			step: step as MultiChoice,
		};
	}
	if (step["keyFilter"]) {
		return {
			type: STARTER_TYPES.FILTER,
			step: step as Filter<any>,
		};
	}

	if (step["starterName"]) {
		return {
			type: STARTER_TYPES.STARTER,
			step: step as StarterLink,
		};
	}

	if (step["initGenerator"]) {
		return {
			type: STARTER_TYPES.INIT,
			step: step as CmdInitParams,
		};
	}

	if (step["keys"]) {
		return {
			type: STARTER_TYPES.SET_VALUES,
			step: step as SetValues<any>,
		};
	}

	if (step["inputQuestion"]) {
		return {
			type: STARTER_TYPES.INPUT,
			step: step as Input,
		};
	}

	return {
		type: STARTER_TYPES.UNKNOWN,
		step: step as Record<string, any>,
	};
};
