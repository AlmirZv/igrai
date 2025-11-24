import { closeServer, server } from "./server";
import { State } from "./State";

export async function gracefulShutdown(signal: number | string) {
  if (State.isShuttingDown) return;
  State.isShuttingDown = true;

  console.log(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Close HTTP server if exists
    if (server) {
      console.log('Closing HTTP server...');
      await closeServer();
    }

    // Close db connection here

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:');
    console.error(err)
    process.exit(1);
  }
}

