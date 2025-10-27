export const modifyToKey = (key: string) => {
	const cleanKey = key
		.toLocaleLowerCase()
		.replace(/[^a-z0-9]/gi, " ")
		.trim()
		.split(/\s+/)
		.map((word, index) => {
			if (index === 0) {
				return word;
			}
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join("");
	return cleanKey;
};
