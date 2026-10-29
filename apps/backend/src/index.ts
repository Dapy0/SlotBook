import { createServer } from "./app.ts";

const SHUTDOWN_TIMEOUT_MS = 10_000;

async function main() {
  const app = await createServer();
  let shuttingDown = false;

  async function shutdown(signal: NodeJS.Signals) {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ signal }, "Shutting down");

    const timer = setTimeout(() => {
      app.log.error("Shutdown timed out, forcing exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    timer.unref();

    try {
      await app.close();
      app.log.info("Server closed");
      process.exit(0);
    } catch (err) {
      app.log.error({ err }, "Error during shutdown");
      process.exit(1);
    }
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  process.on("unhandledRejection", (reason) => {
    app.log.fatal({ reason }, "Unhandled rejection");
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    app.log.fatal({ err }, "Uncaught exception");
    process.exit(1);
  });

  try {
    await app.listen({ port: app.config.PORT, host: app.config.APP_HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

await main();
