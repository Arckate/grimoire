export const mergeReplaceObject = (
	oldObject: Record<string, unknown>,
	newValues: Record<string, unknown>,
) => {
	Object.keys(oldObject).forEach((key) => {
		delete oldObject[key];
	});
	Object.entries(newValues).forEach(([key, value]) => {
		oldObject[key] = value;
	});
};
