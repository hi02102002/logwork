import { LinearClient } from "@linear/sdk";
import { env } from "./env";

export const client = new LinearClient({
	apiKey: env.LINEAR_API_KEY,
});
