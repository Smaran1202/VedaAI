import IORedis from "ioredis";
import { env } from "./env";

export function createRedisConnection() {
  if (!env.redisUrl) {
    console.warn("REDIS_URL is not configured. Background generation queue is disabled.");
    return undefined;
  }

  const connection = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true
  });

  connection.on("connect", () => {
    console.info("Redis connected");
  });

  connection.on("error", () => {
    console.error("Redis connection error. Background jobs may be unavailable.");
  });

  return connection;
}
