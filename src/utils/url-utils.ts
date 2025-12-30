export function getIssueKeyFromLinearUrl(url?: string | null) {
	if (!url) return null;
	const m = url.match(/\/issue\/([A-Z]+-\d+)(?:\/|$)/i);
	return m?.[1]?.toUpperCase() ?? null;
}

export function cleanIssueUrl(url?: string | null) {
	if (!url) return null;

	const m = url.match(/^https:\/\/linear\.app\/[^/]+\/issue\/[A-Z]+-\d+/i);

	return m?.[0] ?? null;
}
