import dotenv from "dotenv";
import { existsSync } from "fs";
import path from "path";

const envPath = [
  path.resolve(process.cwd(), "backend", ".env"),
  path.resolve(process.cwd(), ".env")
].find((candidate) => existsSync(candidate));

dotenv.config(envPath ? { path: envPath } : undefined);

function optional(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function port() {
  const value = optional("PORT") ?? "5000";
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("PORT must be a positive integer.");
  }

  return parsed;
}

export const env = {
  nodeEnv: optional("NODE_ENV") ?? "development",
  port: port(),
  mongodbUri: optional("MONGODB_URI"),
  mongodbDnsServers: optional("MONGODB_DNS_SERVERS"),
  clientUrl: optional("CLIENT_URL") ?? "http://localhost:3000",
  backendUrl: optional("BACKEND_URL"),
  redisUrl: optional("REDIS_URL"),
  geminiApiKey: optional("GEMINI_API_KEY"),
  clerkSecretKey: optional("CLERK_SECRET_KEY")
} as const;
