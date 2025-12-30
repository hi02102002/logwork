import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";

dayjs.extend(customParseFormat);

export const getDateFromText = (text: string, createdAt?: string): string => {
	const fallbackDate = createdAt
		? dayjs(createdAt).format("DD/MM/YYYY")
		: dayjs().format("DD/MM/YYYY");
	if (!text) return fallbackDate;

	const regex =
		/\b(0?[1-9]|[12]\d|3[01])[/-](0?[1-9]|1[0-2])(?:[/-](\d{4}))?\b/;

	const match = text.match(regex);
	if (!match) return fallbackDate;

	const day = match[1];
	const month = match[2];
	const year = match[3] ?? String(dayjs().year());

	const parsed = dayjs(`${day}/${month}/${year}`, "DD/MM/YYYY", true);

	return parsed.isValid() ? parsed.format("DD/MM/YYYY") : fallbackDate;
};
