import { startServer } from "./server";
import { State } from "./State";
import { gracefulShutdown } from "./gracefulShutdown";

async function start() {
  await startServer();
}

// For containerized environments
const shutdownSignals = ['SIGTERM', 'SIGINT', 'SIGUSR1', 'SIGUSR2'];

shutdownSignals.forEach(signal => {
  process.on(signal, async () => {
    console.log(`Received ${signal}, shutting down gracefully...`);

    // Set timeout for forced shutdown
    const forceShutdown = setTimeout(() => {
      console.log('Forcing shutdown after timeout');
      process.exit(1);
    }, State.shutdownTimeout); // 30 second timeout

    // Clear timeout if graceful shutdown completes
    try {
      await gracefulShutdown(signal);
      clearTimeout(forceShutdown);
    } catch (err) {
      console.error('Graceful shutdown failed:');
      console.error(err)
      process.exit(1);
    }
  });
});

// Handle process events for container environments
process.on('beforeExit', async (code) => {
  console.log(`Process will exit with code: ${code}`);
  await gracefulShutdown('beforeExit');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:');
  console.error(error)
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

start();
