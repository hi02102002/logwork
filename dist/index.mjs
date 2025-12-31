#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import dayjs from "dayjs";
import { LinearClient } from "@linear/sdk";
import fs, { existsSync } from "node:fs";
import { homedir } from "node:os";
import path, { join } from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import utc from "dayjs/plugin/utc.js";
import { input, select } from "@inquirer/prompts";
import { fileURLToPath } from "node:url";
import Table from "cli-table3";

//#region src/constants.ts
const LOG_WORK_REGEX = /\b(?:\d{1,2}\/\d{1,2}\/\d{4}\s*)?(?:log(?:[-\s]*work)?|work[-\s]*log)\s*:?\s*(\d+(?:\.\d+)?)\s*h?\b/i;

//#endregion
//#region src/env.ts
const possibleEnvPaths = [
	join(homedir(), ".config", "logwork", ".env"),
	join(homedir(), ".logwork", ".env"),
	join(process.cwd(), ".env")
];
for (const envPath of possibleEnvPaths) if (existsSync(envPath)) {
	dotenv.config({ path: envPath });
	break;
}
const env = createEnv({
	server: { LINEAR_API_KEY: z.string().min(1, "LINEAR_API_KEY is required") },
	clientPrefix: "PUBLIC_",
	client: {},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true
});

//#endregion
//#region src/linear.ts
const client = new LinearClient({ apiKey: env.LINEAR_API_KEY });

//#endregion
//#region src/utils/date-utils.ts
dayjs.extend(customParseFormat);
const getDateFromText = (text, createdAt) => {
	const fallbackDate = createdAt ? dayjs(createdAt).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY");
	if (!text) return fallbackDate;
	const match = text.match(/\b(0?[1-9]|[12]\d|3[01])[/-](0?[1-9]|1[0-2])(?:[/-](\d{4}))?\b/);
	if (!match) return fallbackDate;
	const day = match[1];
	const month = match[2];
	const parsed = dayjs(`${day}/${month}/${match[3] ?? String(dayjs().year())}`, "DD/MM/YYYY", true);
	return parsed.isValid() ? parsed.format("DD/MM/YYYY") : fallbackDate;
};

//#endregion
//#region src/utils/regex-utils.ts
const isMatchingRegex = (text, regex) => {
	return (typeof regex === "string" ? new RegExp(regex, "i") : regex).test(text);
};
const extractHoursFromComment = (text, regex) => {
	if (!text) return 0;
	const re = typeof regex === "string" ? new RegExp(regex, "gi") : new RegExp(regex.source, "gi");
	if (text.includes("Passed")) console.log(text);
	let total = 0;
	for (const match of text.matchAll(re)) {
		const hoursMatch = match[0].match(/(?:log(?:\s*work)?|work\s*log|worklog|Log|Logwork|log-work|Log-Work)\s*:?\s*(\d+(?:\.\d+)?)\s*h?/i);
		if (hoursMatch) total += Number(hoursMatch[1]);
	}
	return total;
};

//#endregion
//#region src/utils/url-utils.ts
function cleanIssueUrl(url) {
	if (!url) return null;
	return url.match(/^https:\/\/linear\.app\/[^/]+\/issue\/[A-Z]+-\d+/i)?.[0] ?? null;
}

//#endregion
//#region src/funcs/get-work-logs.ts
function groupByDateThenUrl(items) {
	const result = {};
	for (const { date, url, hours } of items) {
		if (!url || hours === null) continue;
		if (!result[date]) result[date] = {};
		if (!result[date][url]) result[date][url] = 0;
		result[date][url] += hours;
	}
	return result;
}
const mapCommentToWorkLog = (comment) => {
	return {
		url: cleanIssueUrl(comment.url),
		hours: extractHoursFromComment(comment.body, LOG_WORK_REGEX),
		date: getDateFromText(comment.body, comment.createdAt?.toISOString())
	};
};
const getWorkLogs = async ({ from, to }) => {
	const me = await client.viewer;
	const extendedFrom = from ? dayjs(from).startOf("day").subtract(2, "days").toISOString() : void 0;
	const extendedTo = to ? dayjs(to).endOf("day").add(2, "days").toISOString() : void 0;
	const all = [];
	let after;
	do {
		const comments = await client.comments({
			filter: {
				user: { id: { eq: me.id } },
				createdAt: {
					gte: extendedFrom,
					lte: extendedTo
				}
			},
			first: 100,
			after
		});
		await new Promise((resolve) => setTimeout(resolve, 200));
		all.push(...comments.nodes);
		after = comments.pageInfo.hasNextPage ? comments.pageInfo.endCursor ?? void 0 : void 0;
	} while (after);
	return all.filter((comment) => isMatchingRegex(comment.body, LOG_WORK_REGEX)).map(mapCommentToWorkLog).filter((worklog) => {
		const date = dayjs(worklog.date, "DD/MM/YYYY", true);
		if (!date.isValid()) return false;
		if (from && date.isBefore(dayjs(from), "day")) return false;
		if (to && date.isAfter(dayjs(to), "day")) return false;
		return true;
	});
};
const getGroupedWorkLogs = async (params) => {
	return groupByDateThenUrl(await getWorkLogs(params));
};

//#endregion
//#region src/utils/date-parser.ts
dayjs.extend(customParseFormat);
dayjs.extend(utc);
/**
* Parse date string in various formats:
* - YYYY-MM-DD
* - DD/MM/YYYY or DD/MM
* - DD-MM-YYYY or DD-MM
*/
function parseDate(dateStr) {
	for (const format of [
		"YYYY-MM-DD",
		"DD/MM/YYYY",
		"DD/MM",
		"DD-MM-YYYY",
		"DD-MM"
	]) {
		const parsed = dayjs(dateStr, format, true);
		if (parsed.isValid()) return parsed;
	}
	return null;
}
/**
* Parse range string like "7d", "30d", "2w"
* Returns date range ending today
*/
function parseRange(rangeStr) {
	const match = rangeStr.match(/^(\d+)(d|w)$/i);
	if (!match) return null;
	const value = Number.parseInt(match[1]);
	const unit = match[2].toLowerCase();
	const to = dayjs().endOf("day");
	let from;
	if (unit === "d") from = to.subtract(value, "day").startOf("day");
	else if (unit === "w") from = to.subtract(value, "week").startOf("day");
	else return null;
	return {
		from: from.toISOString(),
		to: to.toISOString()
	};
}
/**
* Get date range for today
*/
function getTodayRange() {
	return {
		from: dayjs().startOf("day").toISOString(),
		to: dayjs().endOf("day").toISOString()
	};
}
/**
* Get date range for yesterday
*/
function getYesterdayRange() {
	return {
		from: dayjs().subtract(1, "day").startOf("day").toISOString(),
		to: dayjs().subtract(1, "day").endOf("day").toISOString()
	};
}
/**
* Create date range from two dates
*/
function createDateRange(from, to) {
	const fromDate = parseDate(from);
	const toDate = parseDate(to);
	if (!fromDate || !toDate) return null;
	return {
		from: fromDate.startOf("day").toISOString(),
		to: toDate.endOf("day").toISOString()
	};
}

//#endregion
//#region src/utils/interactive.ts
async function getInteractiveDateRange() {
	const choice = await select({
		message: "Select time range:",
		choices: [
			{
				name: "Today",
				value: "today"
			},
			{
				name: "Yesterday",
				value: "yesterday"
			},
			{
				name: "Last 2 days",
				value: "2d"
			},
			{
				name: "Last 7 days",
				value: "7d"
			},
			{
				name: "Last 30 days",
				value: "30d"
			},
			{
				name: "Last 2 weeks",
				value: "2w"
			},
			{
				name: "Custom date range",
				value: "custom"
			}
		]
	});
	if (choice === "today") return getTodayRange();
	if (choice === "yesterday") return getYesterdayRange();
	if (choice === "7d" || choice === "30d" || choice === "2w" || choice === "2d") return parseRange(choice);
	if (choice === "custom") return createDateRange(await input({
		message: "From date (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY]):",
		validate: (value) => {
			if (!value) return "Please enter a date";
			if (!parseDate(value)) return "Invalid date format";
			return true;
		}
	}), await input({
		message: "To date (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY]):",
		default: dayjs().format("YYYY-MM-DD"),
		validate: (value) => {
			if (!value) return "Please enter a date";
			if (!parseDate(value)) return "Invalid date format";
			return true;
		}
	}));
	return null;
}

//#endregion
//#region src/utils/cli-handler.ts
async function getDateRangeFromOptions(options) {
	if (options.today) return getTodayRange();
	if (options.yesterday) return getYesterdayRange();
	if (options.range) {
		const dateRange = parseRange(options.range);
		if (!dateRange) {
			console.error(chalk.red(`Invalid time range format: ${options.range}. Use format like: 7d, 30d, 2w`));
			process.exit(1);
		}
		return dateRange;
	}
	if (options.from && options.to) {
		const dateRange = createDateRange(options.from, options.to);
		if (!dateRange) {
			console.error(chalk.red("Invalid date format for from/to"));
			process.exit(1);
		}
		return dateRange;
	}
	if (options.from) {
		const dateRange = createDateRange(options.from, dayjs().format("YYYY-MM-DD"));
		if (!dateRange) {
			console.error(chalk.red("Invalid date format for from"));
			process.exit(1);
		}
		return dateRange;
	}
	return await getInteractiveDateRange();
}

//#endregion
//#region src/utils/display.ts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function sortDatesByAscending(dates) {
	return dates.sort((a, b) => {
		const [dayA, monthA, yearA] = a.split("/").map(Number);
		const [dayB, monthB, yearB] = b.split("/").map(Number);
		const dateA = new Date(yearA, monthA - 1, dayA);
		const dateB = new Date(yearB, monthB - 1, dayB);
		return dateA.getTime() - dateB.getTime();
	});
}
function displayDateRangeMessage(from, to) {
	console.log(chalk.blue(`\nFetching data from ${dayjs(from).format("DD/MM/YYYY")} to ${dayjs(to).format("DD/MM/YYYY")}...\n`));
}
function displayNoLogsMessage() {
	console.log(chalk.yellow("No work logs found in this time range."));
}
function displayTableFormat(logs) {
	const sortedDates = sortDatesByAscending(Object.keys(logs));
	let totalHours = 0;
	const table = new Table({
		head: [
			chalk.cyan.bold("Date"),
			chalk.cyan.bold("Issue URL"),
			chalk.cyan.bold("Hours")
		],
		style: {
			head: [],
			border: ["gray"]
		},
		colWidths: [
			15,
			70,
			10
		],
		wordWrap: true
	});
	for (const date of sortedDates) {
		const urls = logs[date];
		let dayTotal = 0;
		const urlEntries = Object.entries(urls);
		for (let i = 0; i < urlEntries.length; i++) {
			const [url, hours] = urlEntries[i];
			table.push([
				i === 0 ? chalk.yellow(date) : "",
				chalk.gray(url),
				chalk.green(`${hours}h`)
			]);
			dayTotal += hours;
			totalHours += hours;
		}
		table.push([
			"",
			chalk.white.bold("Daily total:"),
			chalk.white.bold(`${dayTotal}h`)
		]);
		if (date !== sortedDates[sortedDates.length - 1]) table.push([{
			colSpan: 3,
			content: "",
			hAlign: "center"
		}]);
	}
	console.log(table.toString());
	console.log(chalk.magenta.bold(`\nTotal hours: ${totalHours}h`));
}
function exportToMarkdown(logs, outputPath) {
	const sortedDates = sortDatesByAscending(Object.keys(logs));
	const projectRoot = path.resolve(__dirname, "..");
	const reportsDir = path.join(projectRoot, "reports");
	if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
	const exportedFiles = [];
	for (const date of sortedDates) {
		const urls = logs[date];
		let markdown = `# Work Log - ${date}\n\n`;
		markdown += `*Generated on ${dayjs().format("DD/MM/YYYY HH:mm:ss")}*\n\n`;
		let dayTotal = 0;
		markdown += "## Tasks\n\n";
		markdown += "| Issue URL | Hours |\n";
		markdown += "|-----------|-------|\n";
		for (const [url, hours] of Object.entries(urls)) {
			markdown += `| [${url}](${url}) | **${hours}h** |\n`;
			dayTotal += hours;
		}
		markdown += `\n**Total: ${dayTotal}h**\n\n`;
		markdown += "---\n\n";
		markdown += "## Slack Format (Copy Below)\n\n";
		markdown += `**${date}**\n\n`;
		markdown += "```\n";
		const uniqueUrls = Object.keys(urls);
		for (const url of uniqueUrls) markdown += `${url}\n`;
		markdown += "```\n";
		const [day, month, year] = date.split("/");
		const fileName = outputPath ? outputPath : path.join(reportsDir, `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}.md`);
		fs.writeFileSync(fileName, markdown, "utf-8");
		exportedFiles.push(fileName);
	}
	console.log(chalk.green(`\n✓ ${exportedFiles.length} markdown file(s) exported:`));
	for (const file of exportedFiles) console.log(chalk.gray(`  ${file}`));
	return exportedFiles;
}

//#endregion
//#region src/index.ts
const program = new Command();
async function fetchAndDisplayLogs(dateRange, options) {
	displayDateRangeMessage(dateRange.from, dateRange.to);
	const logs = await getGroupedWorkLogs(dateRange);
	if (Object.keys(logs).length === 0) {
		displayNoLogsMessage();
		return;
	}
	displayTableFormat(logs);
	exportToMarkdown(logs, options?.output);
}
program.name("logwork").description("CLI tool to manage Linear work logs").version("1.0.0").option("--today", "Get today's logs").option("--yesterday", "Get yesterday's logs").option("--from <date>", "From date (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY])").option("--to <date>", "To date (YYYY-MM-DD | DD/MM[/YYYY] | DD-MM[-YYYY])").option("--range <range>", "Time range like 7d, 30d, 2w (ending today)").option("-i, --interactive", "Interactive mode").option("--slack", "Export in Slack format").option("-o, --output <path>", "Output path for markdown file").action(async (options) => {
	try {
		const dateRange = await getDateRangeFromOptions(options);
		if (dateRange) await fetchAndDisplayLogs(dateRange, { output: options.output });
		else {
			console.error(chalk.red("Unable to determine date range"));
			process.exit(1);
		}
	} catch (error) {
		console.error(chalk.red("Error:"), error);
		process.exit(1);
	}
});
program.parse();

//#endregion
export {  };