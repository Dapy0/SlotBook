import Fastify from 'fastify';
import { authRoutes } from './modules/auth/auth.routes.js';


export function createServer(){
  const app = Fastify({
    logger: true
  })

  // app.register(cookie)

  app.get('/health', async (req,res)=> res.send("All is ok"))


  app.register(authRoutes, {prefix: '/auth'})


  return app
}
