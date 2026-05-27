import mongoose from "mongoose";
import dns from "dns";
import { env } from "./env";

const stateLabels: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting"
};

export function getDatabaseStatus() {
  return stateLabels[mongoose.connection.readyState] ?? "unknown";
}

export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.warn("MONGODB_URI is not configured. Database connection skipped.");
    return false;
  }

  configureMongoDns();

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    await mongoose.connect(env.mongodbUri, {
      autoIndex: env.nodeEnv !== "production",
      serverSelectionTimeoutMS: 5000
    });
    console.info(`MongoDB ${getDatabaseStatus()}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection failed. API will continue running with database unavailable.");
    return false;
  }
}

function configureMongoDns() {
  if (!env.mongodbUri?.startsWith("mongodb+srv://")) {
    return;
  }

  const dnsServers = env.mongodbDnsServers
    ?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers?.length) {
    dns.setServers(dnsServers);
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  console.info("MongoDB disconnected");
}

export function registerDatabaseShutdown() {
  const shutdown = async (signal: string) => {
    console.info(`${signal} received. Closing database connection.`);
    await disconnectDatabase();
    process.exit(0);
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}
