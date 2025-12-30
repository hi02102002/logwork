export const isMatchingRegex = (text: string, regex: string | RegExp) => {
	const re = typeof regex === "string" ? new RegExp(regex, "i") : regex;
	return re.test(text);
};

export const extractHoursFromComment = (
	text: string,
	regex: string | RegExp,
): number | null => {
	const re = typeof regex === "string" ? new RegExp(regex, "i") : regex;
	const match = re.exec(text);
	if (match) {
		const hoursMatch = match[0].match(/(\d+(?:\.\d+)?)h?/i);
		if (hoursMatch) {
			return Number(hoursMatch[1]);
		}
	}
	return null;
};
