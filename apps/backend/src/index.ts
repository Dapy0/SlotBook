import { createServer } from "./app.ts";

async function main() {
  const app = await createServer();

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

main();
