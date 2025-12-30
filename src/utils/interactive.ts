import { input, select } from "@inquirer/prompts";
import dayjs from "dayjs";
import type { DateRange } from "./date-parser";
import {
	createDateRange,
	getTodayRange,
	getYesterdayRange,
	parseDate,
	parseRange,
} from "./date-parser";

export async function getInteractiveDateRange(): Promise<DateRange | null> {
	const choice = await select({
		message: "Select time range:",
		choices: [
			{ name: "Today", value: "today" },
			{ name: "Yesterday", value: "yesterday" },
			{ name: "Last 2 days", value: "2d" },
			{ name: "Last 7 days", value: "7d" },
			{ name: "Last 30 days", value: "30d" },
			{ name: "Last 2 weeks", value: "2w" },
			{ name: "Custom date range", value: "custom" },
		],
	});

	if (choice === "today") {
		return getTodayRange();
	}

	if (choice === "yesterday") {
		return getYesterdayRange();
	}

	if (choice === "7d" || choice === "30d" || choice === "2w" || choice === "2d") {
		return parseRange(choice);
	}

	if (choice === "custom") {
		const fromStr = await input({
			message: "From date (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY]):",
			validate: (value) => {
				if (!value) return "Please enter a date";
				const parsed = parseDate(value);
				if (!parsed) return "Invalid date format";
				return true;
			},
		});

		const toStr = await input({
			message: "To date (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY]):",
			default: dayjs().format("YYYY-MM-DD"),
			validate: (value) => {
				if (!value) return "Please enter a date";
				const parsed = parseDate(value);
				if (!parsed) return "Invalid date format";
				return true;
			},
		});

		return createDateRange(fromStr, toStr);
	}

	return null;
}
