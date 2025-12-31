export const isMatchingRegex = (text: string, regex: string | RegExp) => {
	const re = typeof regex === "string" ? new RegExp(regex, "i") : regex;
	return re.test(text);
};

export const extractHoursFromComment = (
	text: string,
	regex: string | RegExp,
): number => {
	if (!text) return 0;

	// Ép regex có flag g + i
	const re =
		typeof regex === "string"
			? new RegExp(regex, "gi")
			: new RegExp(regex.source, "gi");

	if (text.includes('Passed')) {
		console.log(text)
	}

	let total = 0;

	for (const match of text.matchAll(re)) {
		const hoursMatch = match[0].match(
			/(?:log(?:\s*work)?|work\s*log|worklog|Log|Logwork|log-work|Log-Work)\s*:?\s*(\d+(?:\.\d+)?)\s*h?/i,
		);

		if (hoursMatch) {
			total += Number(hoursMatch[1]);
		}
	}

	return total;
};
