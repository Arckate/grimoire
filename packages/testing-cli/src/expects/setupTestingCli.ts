import type { Expect, ExpectResult } from "../entities/Expect";

export const setupTestingCli = (expect: Expect) => {
	expect.extend({
		toBeInTerm(received: string | null): ExpectResult {
			const isString = typeof received === "string";

			return {
				pass: isString,
				message: () =>
					isString
						? `✅ Found in term: "${received}"`
						: `❌ Expected value to be in term output`,
			};
		},
	});
};
