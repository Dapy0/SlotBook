import { createServer } from './server.ts';

async function main() {
  const app = await createServer();

  try {
    await app.listen({ port: app.config.PORT, host: 'localhost' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
