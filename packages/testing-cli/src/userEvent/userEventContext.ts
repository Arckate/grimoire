import { MockSTDIN } from "../MockSTDIN";

export interface UserEventContext {
	stdin: MockSTDIN;
	count: number;
	currentId: number;
}

const userEventContexts: Record<string, UserEventContext> = {};

export const setUserEventContext = (seed: string) => {
	const mockStdin = new MockSTDIN(process.stdin);
	const context: UserEventContext = {
		stdin: mockStdin,
		count: 0,
		currentId: 1,
	};
	userEventContexts[seed] = context;
};

export const getUserEventContext = (seed: string): UserEventContext => {
	if (userEventContexts[seed]) {
		return { ...userEventContexts[seed] };
	}
};

export const setCount = (seed: string, count: number) => {
	if (userEventContexts[seed]) {
		userEventContexts[seed].count = count;
	}
};

export const getCount = (seed: string): number => {
	if (userEventContexts[seed]) {
		return userEventContexts[seed].count;
	}
};

export const setCurrentId = (seed: string, currentId: number) => {
	if (userEventContexts[seed]) {
		userEventContexts[seed].currentId = currentId;
	}
};

export const getCurrentId = (seed: string) => {
	if (userEventContexts[seed]) {
		return userEventContexts[seed].currentId;
	}
};

export const getStdin = (seed: string): MockSTDIN => {
	if (userEventContexts[seed]) {
		return userEventContexts[seed].stdin;
	}
	return new MockSTDIN(process.stdin);
};

export const cleanUserEventContext = (seed: string): void => {
	delete userEventContexts[seed];
};
