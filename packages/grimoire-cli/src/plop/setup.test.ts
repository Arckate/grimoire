import * as globalConfig from "@arckate/grimoire-core/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import setup from "./setup";

let plopMock: any;

beforeEach(() => {
	plopMock = {
		setHelper: vi.fn(),
		setPartial: vi.fn(),
		setActionType: vi.fn(),
		setPrompt: vi.fn(),
	};

	vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
		helpers: {
			upper: (txt: string) => txt.toUpperCase(),
		},
		partials: {
			header: "<h1>{{title}}</h1>",
		},
		actions: {
			log: () => "action",
		},
		prompts: {
			customPrompt: (() => ({ name: "custom" })) as any,
		},
	});
});

describe("setup registers plop extensions", () => {
	it("registers helpers", () => {
		// Arrange/Act
		setup(plopMock);

		// Assert
		expect(plopMock.setHelper).toHaveBeenCalledWith(
			"upper",
			expect.any(Function),
		);
	});

	it("registers partials", () => {
		// Arrange/Act
		setup(plopMock);

		// Assert
		expect(plopMock.setPartial).toHaveBeenCalledWith(
			"header",
			"<h1>{{title}}</h1>",
		);
	});

	it("registers actions", () => {
		// Arrange/Act
		setup(plopMock);

		// Assert
		expect(plopMock.setActionType).toHaveBeenCalledWith(
			"log",
			expect.any(Function),
		);
	});

	it("registers prompts", () => {
		// Arrange/Act
		setup(plopMock);

		// Assert
		expect(plopMock.setPrompt).toHaveBeenCalledWith(
			"customPrompt",
			expect.any(Function),
		);
	});
	it("does nothing when getGlobalConfig returns undefined", () => {
		// Arrange/Act
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue(undefined);

		setup(plopMock);

		// Assert
		expect(plopMock.setHelper).not.toHaveBeenCalled();
		expect(plopMock.setPartial).not.toHaveBeenCalled();
		expect(plopMock.setActionType).not.toHaveBeenCalled();
		expect(plopMock.setPrompt).not.toHaveBeenCalled();
	});

	it("skips helpers when helpers are missing", () => {
		// Arrange/Act
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
			partials: { header: "<h1>{{title}}</h1>" },
			actions: { log: () => "action" },
			prompts: { customPrompt: (() => ({ name: "custom" })) as any },
		});

		setup(plopMock);

		// Assert
		expect(plopMock.setHelper).not.toHaveBeenCalled();
		expect(plopMock.setPartial).toHaveBeenCalled();
		expect(plopMock.setActionType).toHaveBeenCalled();
		expect(plopMock.setPrompt).toHaveBeenCalled();
	});

	it("skips partials when partials are missing", () => {
		// Arrange/Act
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
			helpers: { upper: (txt: string) => txt.toUpperCase() },
			actions: { log: () => "action" },
			prompts: { customPrompt: (() => ({ name: "custom" })) as any },
		});

		setup(plopMock);

		// Assert
		expect(plopMock.setPartial).not.toHaveBeenCalled();
		expect(plopMock.setHelper).toHaveBeenCalled();
		expect(plopMock.setActionType).toHaveBeenCalled();
		expect(plopMock.setPrompt).toHaveBeenCalled();
	});

	it("skips actions when actions are missing", () => {
		// Arrange/Act
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
			helpers: { upper: (txt: string) => txt.toUpperCase() },
			partials: { header: "<h1>{{title}}</h1>" },
			prompts: { customPrompt: (() => ({ name: "custom" })) as any },
		});

		setup(plopMock);

		// Assert
		expect(plopMock.setActionType).not.toHaveBeenCalled();
		expect(plopMock.setHelper).toHaveBeenCalled();
		expect(plopMock.setPartial).toHaveBeenCalled();
		expect(plopMock.setPrompt).toHaveBeenCalled();
	});

	it("skips prompts when prompts are missing", () => {
		// Arrange/Act
		vi.spyOn(globalConfig, "getGlobalConfig").mockReturnValue({
			helpers: { upper: (txt: string) => txt.toUpperCase() },
			partials: { header: "<h1>{{title}}</h1>" },
			actions: { log: () => "action" },
		});

		setup(plopMock);

		// Assert
		expect(plopMock.setPrompt).not.toHaveBeenCalled();
		expect(plopMock.setHelper).toHaveBeenCalled();
		expect(plopMock.setPartial).toHaveBeenCalled();
		expect(plopMock.setActionType).toHaveBeenCalled();
	});
});
