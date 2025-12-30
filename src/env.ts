import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

export const env = createEnv({
	server: {
		LINEAR_API_KEY: z.string().min(1, "LINEAR_API_KEY is required"),
	},
	clientPrefix: "PUBLIC_",
	client: {},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
