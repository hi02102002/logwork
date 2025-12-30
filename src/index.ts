import chalk from "chalk";
import { Command } from "commander";
import { getGroupedWorkLogs } from "./funcs/get-work-logs";
import { getDateRangeFromOptions } from "./utils/cli-handler";
import {
	displayDateRangeMessage,
	displayDetailedLogs,
	displayNoLogsMessage,
	displaySlackFormat,
} from "./utils/display";

const program = new Command();

async function fetchAndDisplayLogs(dateRange: { from: string; to: string }) {
	displayDateRangeMessage(dateRange.from, dateRange.to);

	const logs = await getGroupedWorkLogs(dateRange);

	if (Object.keys(logs).length === 0) {
		displayNoLogsMessage();
		return;
	}

	displayDetailedLogs(logs);

	console.log(chalk.yellow.bold("\n\n📋 Format cho Slack (copy bên dưới):"));
	displaySlackFormat(logs);
}

program
	.name("logwork")
	.description("Công cụ CLI quản lý log công việc Linear")
	.version("1.0.0")
	.option("--today", "Lấy log hôm nay")
	.option("--yesterday", "Lấy log hôm qua")
	.option("--from <date>", "Từ ngày (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY])")
	.option("--to <date>", "Đến ngày (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY])")
	.option(
		"--range <range>",
		"Khoảng thời gian như 7d, 30d, 2w (kết thúc hôm nay)",
	)
	.option("-i, --interactive", "Chế độ tương tác")
	.option("--slack", "Xuất theo định dạng Slack")
	.action(async (options) => {
		try {
			const dateRange = await getDateRangeFromOptions(options);

			if (dateRange) {
				await fetchAndDisplayLogs(dateRange);
			} else {
				console.error(chalk.red("Không thể xác định khoảng thời gian"));
				process.exit(1);
			}
		} catch (error) {
			console.error(chalk.red("Lỗi:"), error);
			process.exit(1);
		}
	});

program.parse();
