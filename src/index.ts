import chalk from "chalk";
import { Command } from "commander";
import { getGroupedWorkLogs } from "./funcs/get-work-logs";
import { getDateRangeFromOptions } from "./utils/cli-handler";
import {
	displayDateRangeMessage,
	displayNoLogsMessage,
	displayTableFormat,
	exportToMarkdown,
} from "./utils/display";

const program = new Command();

async function fetchAndDisplayLogs(
	dateRange: { from: string; to: string },
	options?: { output?: string },
) {
	displayDateRangeMessage(dateRange.from, dateRange.to);

	const logs = await getGroupedWorkLogs(dateRange);

	if (Object.keys(logs).length === 0) {
		displayNoLogsMessage();
		return;
	}

	// Always display table format in terminal
	displayTableFormat(logs);

	// Always export to markdown
	exportToMarkdown(logs, options?.output);
}

program
	.name("logwork")
	.description("CLI tool to manage Linear work logs")
	.version("1.0.0")
	.option("--today", "Get today's logs")
	.option("--yesterday", "Get yesterday's logs")
	.option(
		"--from <date>",
		"From date (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY])",
	)
	.option("--to <date>", "To date (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY])")
	.option("--range <range>", "Time range like 7d, 30d, 2w (ending today)")
	.option("-i, --interactive", "Interactive mode")
	.option("--slack", "Export in Slack format")
	.option("-o, --output <path>", "Output path for markdown file")
	.action(async (options) => {
		try {
			const dateRange = await getDateRangeFromOptions(options);

			if (dateRange) {
				await fetchAndDisplayLogs(dateRange, {
					output: options.output,
				});
			} else {
				console.error(chalk.red("Unable to determine date range"));
				process.exit(1);
			}
		} catch (error) {
			console.error(chalk.red("Error:"), error);
			process.exit(1);
		}
	});

program.parse();
