import { createServer } from './server.ts';

async function main() {
  const app = await createServer();

  try {
    await app.listen({ port: app.config.PORT, host: '127.0.0.1' });
    // console.log(`Listening on 127.0.0.1:${app.config.PORT}...`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
