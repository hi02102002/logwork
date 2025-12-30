import chalk from "chalk";
import dayjs from "dayjs";
import type { DateRange } from "./date-parser";
import {
	createDateRange,
	getTodayRange,
	getYesterdayRange,
	parseRange,
} from "./date-parser";
import { getInteractiveDateRange } from "./interactive";

interface CliOptions {
	today?: boolean;
	yesterday?: boolean;
	range?: string;
	from?: string;
	to?: string;
	interactive?: boolean;
	slack?: boolean;
}

export async function getDateRangeFromOptions(
	options: CliOptions,
): Promise<DateRange | null> {
	if (options.today) {
		return getTodayRange();
	}

	if (options.yesterday) {
		return getYesterdayRange();
	}

	if (options.range) {
		const dateRange = parseRange(options.range);
		if (!dateRange) {
			console.error(
				chalk.red(
					`Định dạng khoảng thời gian không hợp lệ: ${options.range}. Sử dụng định dạng như: 7d, 30d, 2w`,
				),
			);
			process.exit(1);
		}
		return dateRange;
	}

	if (options.from && options.to) {
		const dateRange = createDateRange(options.from, options.to);
		if (!dateRange) {
			console.error(chalk.red("Định dạng ngày không hợp lệ cho from/to"));
			process.exit(1);
		}
		return dateRange;
	}

	if (options.from) {
		const dateRange = createDateRange(
			options.from,
			dayjs().format("YYYY-MM-DD"),
		);
		if (!dateRange) {
			console.error(chalk.red("Định dạng ngày không hợp lệ cho from"));
			process.exit(1);
		}
		return dateRange;
	}

	// Mặc định là interactive mode
	return await getInteractiveDateRange();
}
