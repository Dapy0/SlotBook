import { FastifyInstance } from 'fastify';
import '@fastify/jwt';
import type {DB} from '../db/drizzlePlugin.ts'
declare module 'fastify' {
  interface FastifyInstance extends FastifyJwtNamespace<{
    jwtDecode: 'securityJwtDecode';
    jwtSign: 'securityJwtSign';
    jwtVerify: 'securityJwtVerify';
  }> {
    config: {
      PORT: number;
      DATABASE_URL: string;
      JWT_SECRET_KEY: string;
    };
    drizzle: DB;
  }
}
