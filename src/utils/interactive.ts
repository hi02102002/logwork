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
		message: "Chọn khoảng thời gian:",
		choices: [
			{ name: "Hôm nay", value: "today" },
			{ name: "Hôm qua", value: "yesterday" },
			{ name: "7 ngày gần đây", value: "7d" },
			{ name: "30 ngày gần đây", value: "30d" },
			{ name: "2 tuần gần đây", value: "2w" },
			{ name: "Tùy chỉnh khoảng thời gian", value: "custom" },
		],
	});

	if (choice === "today") {
		return getTodayRange();
	}

	if (choice === "yesterday") {
		return getYesterdayRange();
	}

	if (choice === "7d" || choice === "30d" || choice === "2w") {
		return parseRange(choice);
	}

	if (choice === "custom") {
		const fromStr = await input({
			message: "Từ ngày (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY]):",
			validate: (value) => {
				if (!value) return "Vui lòng nhập ngày";
				const parsed = parseDate(value);
				if (!parsed) return "Định dạng ngày không hợp lệ";
				return true;
			},
		});

		const toStr = await input({
			message: "Đến ngày (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY]):",
			default: dayjs().format("YYYY-MM-DD"),
			validate: (value) => {
				if (!value) return "Vui lòng nhập ngày";
				const parsed = parseDate(value);
				if (!parsed) return "Định dạng ngày không hợp lệ";
				return true;
			},
		});

		return createDateRange(fromStr, toStr);
	}

	return null;
}
