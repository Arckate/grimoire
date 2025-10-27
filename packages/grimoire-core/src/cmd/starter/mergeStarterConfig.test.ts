import { describe, expect, it } from "vitest";
import type { Starters } from "../../entities/Starters";
import type { FindConfig } from "../../path/findConfig";
import { mergeStarterConfig } from "./mergeStarterConfig";

const makeConfig = (
	cfg: Partial<FindConfig<Record<string, Starters>>>,
): FindConfig<Record<string, Starters>> => ({
	dirConfig: null,
	defaultDirConfig: null,
	rootConfig: null,
	...cfg,
});

describe("mergeStarterConfig (refactored)", () => {
	it("should replace when generator is exclusive and other keys are present", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterA: {
				step1: { generator: "comp" },
			},
		};

		const dirConfig = {
			starterA: {
				step1: { in: "files" },
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterA: {
				step1: { in: "files" },
			},
		});
	});

	it("should not replace when generator is shared", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterB: {
				step1: { generator: "comp" },
			},
		};

		const dirConfig = {
			starterB: {
				step1: { generator: "comp", in: "files" },
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterB: {
				step1: { generator: "comp", in: "files" },
			},
		});
	});

	it("should replace when question is exclusive and other keys are present", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterC: {
				step1: { question: "Choose one" },
			},
		};

		const dirConfig = {
			starterC: {
				step1: { generator: "comp" },
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterC: {
				step1: { generator: "comp" },
			},
		});
	});

	it("should merge all three configs with correct replacement", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterD: {
				step1: { generator: "comp" },
			},
		};

		const dirConfig = {
			starterD: {
				step1: { in: "files" },
			},
		};

		const rootConfig = {
			starterD: {
				step2: {
					question: "Choose one",
					name: "framework",
					values: {
						default: { generator: "comp" },
					},
				},
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig, rootConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterD: {
				step1: { in: "files" },
				step2: {
					question: "Choose one",
					name: "framework",
					values: {
						default: { generator: "comp" },
					},
				},
			},
		});
	});

	it("should handle null configs gracefully", () => {
		// Arrange/Act
		const rootConfig = {
			starterE: {
				step1: { generator: "controller" },
			},
		};

		const result = mergeStarterConfig(makeConfig({ rootConfig } as any));

		// Assert
		expect(result).toEqual({
			starterE: {
				step1: { generator: "controller" },
			},
		});
	});

	it("should replace when starterName is exclusive and other keys are present", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterG: {
				step1: {
					starterName: "baseStarter",
					nameSpace: "core",
				},
			},
		};

		const dirConfig = {
			starterG: {
				step1: {
					in: "files",
				},
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterG: {
				step1: {
					in: "files",
				},
			},
		});
	});

	it("should replace when question is in dirConfig and other keys are in defaultDirConfig", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterI: {
				step1: {
					generator: "comp",
				},
			},
		};

		const dirConfig = {
			starterI: {
				step1: {
					question: "Choose your framework",
				},
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterI: {
				step1: {
					question: "Choose your framework",
				},
			},
		});
	});

	it("should replace when 'in' is in dirConfig and other keys are in defaultDirConfig", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterJ: {
				step1: {
					in: "comp", // other key
				},
			},
		};

		const dirConfig = {
			starterJ: {
				step1: {
					generator: "files",
				},
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterJ: {
				step1: {
					generator: "files",
				},
			},
		});
	});

	it("should replace when keyFilter is in dirConfig and other keys are in defaultDirConfig", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterK: {
				step1: {
					keyFilter: "filterA",
					defaultFilter: "default",
					values: {},
				},
			},
		};

		const dirConfig = {
			starterK: {
				step1: {
					generator: "comp",
				},
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterK: {
				step1: {
					generator: "comp",
				},
			},
		});
	});

	it("should replace when initGenerator is exclusive and other keys are present", () => {
		// Arrange/Act
		const defaultDirConfig = {
			starterA: {
				step1: { initGenerator: "default" },
			},
		};

		const dirConfig = {
			starterA: {
				step1: { in: "files" },
			},
		};

		const result = mergeStarterConfig(
			makeConfig({ defaultDirConfig, dirConfig } as any),
		);

		// Assert
		expect(result).toEqual({
			starterA: {
				step1: { in: "files" },
			},
		});
	});
});
