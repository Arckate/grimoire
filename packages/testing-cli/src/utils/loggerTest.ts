interface loggerTestOptions {
	stoutWrite: any;
	escapeAnsi?: boolean;
}
export const loggerTest = (
	{ stoutWrite, escapeAnsi = false }: loggerTestOptions,
	...args: (string | object)[]
) => {
	const formatted = args
		.map((arg) => {
			if (typeof arg === "object") {
				return JSON.stringify(arg, null, 2);
			}
			return arg;
		})
		.join(" ");

	let clearFormatted = formatted;
	if (escapeAnsi) {
		clearFormatted = formatted
			.replace(/\u001b/g, "\\u001b")
			.replace(/\n/g, "\\n\n");
	}
	stoutWrite(`${clearFormatted}\n`);
};

export const debugCommandTest =
	(stoutWrite: any) =>
	(value: string[], escapeAnsi: boolean = false) => {
		value.forEach((value) => {
			loggerTest({ stoutWrite, escapeAnsi }, value);
		});
	};

export const debugTermTest =
	(stoutWrite: any, value: any[][]) =>
	(escapeAnsi: boolean = false) => {
		value.forEach((values) => {
			loggerTest({ stoutWrite, escapeAnsi }, ...values);
		});
	};
