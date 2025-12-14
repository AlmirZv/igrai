// Load environment variables first, before any other imports
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Try to load .env file from project root
// The .env file should be in the root of the project (d:\lootai\.env)
// We need to go up from backend/src/ or backend/dist/ to reach the root
const possiblePaths = [
  resolve(process.cwd(), "../.env"), // From backend/ directory
  resolve(__dirname, "../../.env"), // From backend/src/ or backend/dist/
  resolve(process.cwd(), ".env"), // In case .env is in backend/
];

let envPath: string | null = null;
for (const path of possiblePaths) {
  if (existsSync(path)) {
    envPath = path;
    break;
  }
}

if (envPath) {
  const result = config({ path: envPath });
  if (result.error) {
    console.warn("⚠️  Could not load .env file:", result.error.message);
  } else {
    console.log("✅ Environment variables loaded from:", envPath);
  }
} else {
  console.warn("⚠️  .env file not found. Tried paths:", possiblePaths);
  console.warn(
    "⚠️  Make sure .env file exists in the project root (d:\\lootai\\.env)"
  );
}

import { startServer } from "./server";
import { State } from "./State";
import { gracefulShutdown } from "./gracefulShutdown";

async function start() {
  await startServer();
}

// For containerized environments
const shutdownSignals = ["SIGTERM", "SIGINT", "SIGUSR1", "SIGUSR2"];

shutdownSignals.forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);

    // Set timeout for forced shutdown
    const forceShutdown = setTimeout(() => {
      console.log("Forcing shutdown after timeout");
      process.exit(1);
    }, State.shutdownTimeout); // 30 second timeout

    // Clear timeout if graceful shutdown completes
    try {
      await gracefulShutdown(signal);
      clearTimeout(forceShutdown);
    } catch (err) {
      console.error("Graceful shutdown failed:");
      console.error(err);
      process.exit(1);
    }
  });
});

// Handle process events for container environments
process.on("beforeExit", async (code) => {
  console.log(`Process will exit with code: ${code}`);
  await gracefulShutdown("beforeExit");
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:");
  console.error(error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

start();
