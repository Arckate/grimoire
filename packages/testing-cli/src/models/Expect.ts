export interface Expect {
	extend(matchers: Record<string, (...args: any[]) => ExpectResult>): void;
}

export interface ExpectResult {
	pass: boolean;
	message: () => string;
}
