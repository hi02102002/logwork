export const LOG_WORK_REGEX =
	/\b(?:\d{1,2}\/\d{1,2}\/\d{4}\s*)?(?:log(?:[-\s]*work)?|work[-\s]*log)\s*:\s*(\d+(?:\.\d+)?)\s*h?\b/i;

export const LOG_LINE_REGEX =
	/(?:^|\n)\s*(?:log(?:\s*work)?|work\s*log|worklog|Log|Logwork)\s*:\s*(\d+(?:\.\d+)?)\s*h?\b/gi;
