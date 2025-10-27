export interface Plan {
	genName: string;
	genId: string;
	genMeta?: Record<string, unknown>;
	planName?: string;
	genDest?: string;
	genLink?: string;
	[x: string]: unknown | Plan | Plan[];
}
