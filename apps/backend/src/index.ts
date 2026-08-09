import { createServer } from './server.js';
import { checkDBConnection } from './db/index.js';

const app = createServer();

try {
  await checkDBConnection();
  app.log.info('DB connected');
  app.listen({ port: app.config.PORT }, () => {
    app.log.info(`Listening on ${app.config.PORT}...`);
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
