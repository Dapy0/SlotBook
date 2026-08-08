import { createServer } from './server.js';
import { checkDBConnection } from './db/index.js';

const app = createServer();

try {
  await checkDBConnection();
  app.log.info('DB connected');

  const PORT = Number(process.env.PORT) || 3001;
  app.listen({ port: PORT }, () => {
    app.log.info(`Listening on ${PORT}...`);
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
