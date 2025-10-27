import "vitest";

declare module "vitest" {
	// biome-ignore lint/correctness/noUnusedVariables: <type>
	interface Assertion<T = any> {
		toBeInTerm(): void;
	}
}
