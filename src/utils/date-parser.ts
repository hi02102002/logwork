import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export interface DateRange {
	from: string;
	to: string;
}

/**
 * Parse date string in various formats:
 * - YYYY-MM-DD
 * - DD/MM/YYYY or DD/MM
 * - DD-MM-YYYY or DD-MM
 */
export function parseDate(dateStr: string): dayjs.Dayjs | null {
	const formats = ["YYYY-MM-DD", "DD/MM/YYYY", "DD/MM", "DD-MM-YYYY", "DD-MM"];

	for (const format of formats) {
		const parsed = dayjs(dateStr, format, true);
		if (parsed.isValid()) {
			return parsed;
		}
	}

	return null;
}

/**
 * Parse range string like "7d", "30d", "2w"
 * Returns date range ending today
 */
export function parseRange(rangeStr: string): DateRange | null {
	const match = rangeStr.match(/^(\d+)(d|w)$/i);
	if (!match) return null;

	const value = Number.parseInt(match[1]);
	const unit = match[2].toLowerCase();

	const to = dayjs().endOf("day");
	let from: dayjs.Dayjs;

	if (unit === "d") {
		from = to.subtract(value, "day").startOf("day");
	} else if (unit === "w") {
		from = to.subtract(value, "week").startOf("day");
	} else {
		return null;
	}

	return {
		from: from.toISOString(),
		to: to.toISOString(),
	};
}

/**
 * Get date range for today
 */
export function getTodayRange(): DateRange {
	return {
		from: dayjs().startOf("day").toISOString(),
		to: dayjs().endOf("day").toISOString(),
	};
}

/**
 * Get date range for yesterday
 */
export function getYesterdayRange(): DateRange {
	return {
		from: dayjs().subtract(1, "day").startOf("day").toISOString(),
		to: dayjs().subtract(1, "day").endOf("day").toISOString(),
	};
}

/**
 * Create date range from two dates
 */
export function createDateRange(from: string, to: string): DateRange | null {
	const fromDate = parseDate(from);
	const toDate = parseDate(to);

	if (!fromDate || !toDate) return null;

	return {
		from: fromDate.startOf("day").toISOString(),
		to: toDate.endOf("day").toISOString(),
	};
}
