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
