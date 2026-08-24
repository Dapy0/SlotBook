import type { NextConfig } from 'next';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

const backendEnvPath = path.resolve(process.cwd(), '../backend/.env');

if (!fs.existsSync(backendEnvPath)) {
  throw new Error(`Backend .env not found at ${backendEnvPath}`);
}

const backendEnv = dotenv.parse(fs.readFileSync(backendEnvPath));
const BACKEND_PORT = backendEnv.PORT;

const nextConfig: NextConfig = {
  env: {
    BACKEND_URL: `http://localhost:${BACKEND_PORT}`,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1'],
};

export default nextConfig;
