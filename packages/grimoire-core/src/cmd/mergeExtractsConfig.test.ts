import { describe, expect, it } from "vitest";
import type { ExtractFindDir, ExtractsConfig } from "~/entities/Extracts";
import { mergeExtractsConfig } from "./mergeExtractsConfig";

const mockExtractFn = (label: string): ExtractsConfig[string] => {
	return () => ({ description: `from ${label}` });
};

describe("mergeExtractsConfig", () => {
	it("should merge all three configs", () => {
		// Arrange/Act
		const defaultDirConfig: ExtractsConfig = {
			default: mockExtractFn("default"),
		};
		const dirConfig: ExtractsConfig = {
			dir: mockExtractFn("dir"),
		};
		const rootConfig: ExtractsConfig = {
			root: mockExtractFn("root"),
		};

		const dummyExtractFindDir: ExtractFindDir = () => "dummy/path";

		const result: any = mergeExtractsConfig({
			dirConfig,
			defaultDirConfig,
			rootConfig,
		});

		// Assert
		expect(Object.keys(result)).toEqual(["default", "dir", "root"]);
		expect(result.default(dummyExtractFindDir).description).toBe(
			"from default",
		);
		expect(result.dir(dummyExtractFindDir).description).toBe("from dir");
		expect(result.root(dummyExtractFindDir).description).toBe("from root");
	});

	it("should handle null configs", () => {
		// Arrange/Act
		const result: any = mergeExtractsConfig({
			dirConfig: null,
			defaultDirConfig: null,
			rootConfig: {
				onlyRoot: mockExtractFn("root"),
			},
		});

		// Assert
		const dummyExtractFindDir: ExtractFindDir = () => "dummy/path";

		expect(Object.keys(result)).toEqual(["onlyRoot"]);
		expect(result.onlyRoot(dummyExtractFindDir).description).toBe("from root");
	});

	it("should override default with dir and root", () => {
		// Arrange/Act
		const defaultDirConfig: ExtractsConfig = {
			shared: mockExtractFn("default"),
		};
		const dirConfig: ExtractsConfig = {
			shared: mockExtractFn("dir"),
		};
		const rootConfig: ExtractsConfig = {
			shared: mockExtractFn("root"),
		};

		const dummyExtractFindDir: ExtractFindDir = () => "dummy/path";

		const result: any = mergeExtractsConfig({
			dirConfig,
			defaultDirConfig,
			rootConfig,
		});

		// Assert
		expect(result.shared(dummyExtractFindDir).description).toBe("from root");
	});

	it("should handle null rootConfig", () => {
		// Arrange/Act
		const defaultDirConfig: ExtractsConfig = {
			default: () => ({ description: "from default" }),
		};
		const dirConfig: ExtractsConfig = {
			dir: () => ({ description: "from dir" }),
		};

		const result = mergeExtractsConfig({
			dirConfig,
			defaultDirConfig,
			rootConfig: null,
		});

		// Assert
		expect(Object.keys(result)).toEqual(["default", "dir"]);
	});
});
