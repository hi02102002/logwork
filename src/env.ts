import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import { z } from "zod";

// Tìm .env file ở các vị trí sau theo thứ tự:
// 1. ~/.config/logwork/.env
// 2. ~/.logwork/.env
// 3. Thư mục hiện tại
const possibleEnvPaths = [
	join(homedir(), ".config", "logwork", ".env"),
	join(homedir(), ".logwork", ".env"),
	join(process.cwd(), ".env"),
];

for (const envPath of possibleEnvPaths) {
	if (existsSync(envPath)) {
		dotenv.config({ path: envPath });
		break;
	}
}

export const env = createEnv({
	server: {
		LINEAR_API_KEY: z.string().min(1, "LINEAR_API_KEY is required"),
	},
	clientPrefix: "PUBLIC_",
	client: {},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
