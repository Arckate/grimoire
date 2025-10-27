import fs from "node:fs";

type RecordCamelCase<T extends string | number | symbol, U> = Record<T, U>;

export const readCamelCaseJson = (
	path: string,
): RecordCamelCase<string, string> => {
	try {
		const content = fs.readFileSync(path, "utf-8");
		return JSON.parse(content);
	} catch {
		throw new Error(`Failed to read or parse JSON at ${path}`);
	}
};

export const writeCamelCaseJson = (
	path: string,
	data: RecordCamelCase<string, string>,
): void => {
	try {
		fs.writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
	} catch {
		throw new Error(`Failed to write JSON to ${path}`);
	}
};

export const stringToCamelCaseJson = (
	text: string,
): RecordCamelCase<string, string> => {
	try {
		return JSON.parse(text);
	} catch {
		throw new Error(`Failed to parse JSON from text`);
	}
};
