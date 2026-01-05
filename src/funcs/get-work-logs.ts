import type { Comment } from "@linear/sdk";
import dayjs from "dayjs";
import { LOG_WORK_REGEX } from "../constants";
import { client } from "../linear";
import {
	cleanIssueUrl,
	extractHoursFromComment,
	getDateFromText,
	isMatchingRegex,
} from "../utils";

export function groupByDateThenUrl(
	items: Awaited<ReturnType<typeof getWorkLogs>>,
) {
	const result: Record<string, Record<string, number>> = {};

	for (const { date, url, hours } of items) {
		if (!url || hours === null) continue;

		if (!result[date]) {
			result[date] = {};
		}

		if (!result[date][url]) {
			result[date][url] = 0;
		}

		result[date][url] += hours;
	}

	return result;
}

const mapCommentToWorkLog = (comment: Comment) => {
	console.log(comment.id, comment.body);

	return {
		url: cleanIssueUrl(comment.url),
		hours: extractHoursFromComment(comment.body, LOG_WORK_REGEX),
		date: getDateFromText(comment.body, comment.createdAt?.toISOString()),
	};
};

const getWorkLogs = async ({ from, to }: { from?: string; to?: string }) => {
	const me = await client.viewer;

	const extendedFrom = from
		? dayjs(from).startOf("day").subtract(2, "days").toISOString()
		: undefined;
	const extendedTo = to
		? dayjs(to).endOf("day").add(2, "days").toISOString()
		: undefined;

	const all: Comment[] = [];
	let after: string | undefined;

	do {
		const comments = await client.comments({
			filter: {
				user: { id: { eq: me.id } },
				createdAt: {
					gte: extendedFrom,
					lte: extendedTo,
				},
			},
			first: 100,
			after,
		});

		await new Promise((resolve) => setTimeout(resolve, 200));

		all.push(...comments.nodes);
		after = comments.pageInfo.hasNextPage
			? (comments.pageInfo.endCursor ?? undefined)
			: undefined;
	} while (after);

	return all
		.filter((comment) => isMatchingRegex(comment.body, LOG_WORK_REGEX))
		.filter((comment) => {
			const date = dayjs(
				getDateFromText(comment.body, comment.createdAt?.toISOString()),
				"DD/MM/YYYY",
				true,
			);

			if (!date.isValid()) return false;

			if (from && date.isBefore(dayjs(from), "day")) return false;
			if (to && date.isAfter(dayjs(to), "day")) return false;

			return true;
		})
		.map(mapCommentToWorkLog);
};

export const getGroupedWorkLogs = async (params: {
	from?: string;
	to?: string;
}) => {
	const workLogs = await getWorkLogs(params);
	return groupByDateThenUrl(workLogs);
};
