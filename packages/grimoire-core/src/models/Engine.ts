import type { ActionFn, ProcessTerm, PromptFn } from "~/models";

export interface EngineData {
	dest: string;
	force: boolean;
	globals: Record<string, any>;
	dirnames: Record<string, any>;
	custom: Record<string, any>;
	answer: Record<string, any>;
}

export interface EngineInit {
	processTerm: Partial<ProcessTerm>;
	dest?: string;
	force?: boolean;
	globals?: Record<string, any>;
	dirnames?: Record<string, any>;
	custom?: Record<string, any>;
	actions?: Record<string, ActionFn>;
	prompts?: Record<string, PromptFn>;
	tools?: Record<string, Record<string, any>>;
	config?: Record<string, any>;
}
