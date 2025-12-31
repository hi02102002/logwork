import fs from "node:fs";
import path from "node:path";
import chalk from "chalk";
import dayjs from "dayjs";

export function sortDatesByAscending(dates: string[]): string[] {
	return dates.sort((a, b) => {
		const [dayA, monthA, yearA] = a.split("/").map(Number);
		const [dayB, monthB, yearB] = b.split("/").map(Number);
		const dateA = new Date(yearA, monthA - 1, dayA);
		const dateB = new Date(yearB, monthB - 1, dayB);
		return dateA.getTime() - dateB.getTime();
	});
}

export function displaySlackFormat(
	logs: Record<string, Record<string, number>>,
) {
	const sortedDates = sortDatesByAscending(Object.keys(logs));

	for (let i = 0; i < sortedDates.length; i++) {
		const date = sortedDates[i];
		const urls = logs[date];

		console.log(date);
		console.log("```");
		const uniqueUrls = Object.keys(urls);
		for (const url of uniqueUrls) {
			console.log(url);
		}
		console.log("```");

		if (i < sortedDates.length - 1) {
			console.log();
		}
	}
}

export function displayDetailedLogs(
	logs: Record<string, Record<string, number>>,
) {
	let totalHours = 0;
	const sortedDates = sortDatesByAscending(Object.keys(logs));

	for (const date of sortedDates) {
		const urls = logs[date];
		console.log(chalk.cyan.bold(`\n${date}:`));
		let dayTotal = 0;

		for (const [url, hours] of Object.entries(urls)) {
			console.log(chalk.gray(`  ${url}: ${chalk.green(`${hours}h`)}`));
			dayTotal += hours;
			totalHours += hours;
		}

		console.log(chalk.white(`  Daily total: ${chalk.bold(`${dayTotal}h`)}`));
	}

	console.log(chalk.magenta.bold(`\nTotal hours: ${totalHours}h`));
}

export function displayDateRangeMessage(from: string, to: string) {
	console.log(
		chalk.blue(
			`\nFetching data from ${dayjs(from).format("DD/MM/YYYY")} to ${dayjs(to).format("DD/MM/YYYY")}...\n`,
		),
	);
}

export function displayNoLogsMessage() {
	console.log(chalk.yellow("No work logs found in this time range."));
}

export function exportToMarkdown(
	logs: Record<string, Record<string, number>>,
	outputPath?: string,
) {
	const sortedDates = sortDatesByAscending(Object.keys(logs));

	// Create reports directory if it doesn't exist
	const reportsDir = path.join(process.cwd(), "reports");
	if (!fs.existsSync(reportsDir)) {
		fs.mkdirSync(reportsDir, { recursive: true });
	}

	const exportedFiles: string[] = [];

	// Export each date to a separate file
	for (const date of sortedDates) {
		const urls = logs[date];
		let markdown = `# Work Log - ${date}\n\n`;
		markdown += `*Generated on ${dayjs().format("DD/MM/YYYY HH:mm:ss")}*\n\n`;

		let dayTotal = 0;

		// Detailed view with clickable links
		markdown += "## Tasks\n\n";
		for (const [url, hours] of Object.entries(urls)) {
			markdown += `- [${url}](${url}) - **${hours}h**\n`;
			dayTotal += hours;
		}

		markdown += `\n**Total: ${dayTotal}h**\n\n`;
		markdown += "---\n\n";

		// Slack format
		markdown += "## Slack Format (Copy Below)\n\n";
		markdown += `**${date}**\n\n`;
		markdown += "```\n";

		const uniqueUrls = Object.keys(urls);
		for (const url of uniqueUrls) {
			markdown += `${url}\n`;
		}

		markdown += "```\n";

		// Convert DD/MM/YYYY to YYYY-MM-DD for filename
		const [day, month, year] = date.split("/");
		const fileName = outputPath
			? outputPath
			: path.join(reportsDir, `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}.md`);

		fs.writeFileSync(fileName, markdown, "utf-8");
		exportedFiles.push(fileName);
	}

	console.log(chalk.green(`✓ ${exportedFiles.length} markdown file(s) exported:`));
	for (const file of exportedFiles) {
		console.log(chalk.gray(`  - ${file}`));
	}

	return exportedFiles;
}
