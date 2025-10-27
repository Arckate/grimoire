export interface GenObject {
	genName: string;
	genId: string;
	genMeta: Record<string, unknown>;
	genFileName?: string;
	genDest?: string;
	genLink?: string;
	[x: string]: unknown | GenObject | GenObject[];
}
