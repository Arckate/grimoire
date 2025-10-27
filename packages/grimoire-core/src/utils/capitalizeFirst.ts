export const capitalizeFirst = (string: string) => {
	if (string.length) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	return string;
};
