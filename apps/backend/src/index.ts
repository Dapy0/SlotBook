import { createServer } from "./app.ts";

async function main() {
  const app = await createServer();

  try {
    await app.listen({ port: app.config.PORT, host: app.config.APP_HOST });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
