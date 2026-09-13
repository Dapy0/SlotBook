import type { NextConfig } from "next";
import path from "path";
import fs from "fs";

// const backendEnvPath = path.resolve(process.cwd(), '../backend/.env');

// if (!fs.existsSync(backendEnvPath)) {
//   throw new Error(`Backend .env not found at ${backendEnvPath}`);
// }

// const backendEnv = dotenv.parse(fs.readFileSync(backendEnvPath));
// const BACKEND_PORT = backendEnv.PORT;
const nextConfig: NextConfig = {
  // env: {
  //   NEXT_PUBLIC_BACKEND_URL: `http://localhost:${BACKEND_PORT}`,
  // },
  typedRoutes: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
};

export default nextConfig;
