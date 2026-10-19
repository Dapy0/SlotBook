import path from "path";
import { fileURLToPath } from "url";
import type { FileStorage } from "../lib/storage/FileStorage";
import type { FastifyInstance } from "fastify";
import { LocalDiskStorage } from "../lib/storage/LocalDiskStorage";
import fastifyStatic from "@fastify/static";
import fp from "fastify-plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export type StoragePluginOptions = { storage?: FileStorage | undefined };

async function storagePlugin(fastify: FastifyInstance, opts: StoragePluginOptions) {
  const uploadRoot = path.resolve(__dirname, "../..", fastify.config.UPLOAD_DIR);
  fastify.decorate("storage", opts.storage ?? new LocalDiskStorage(uploadRoot));
  await fastify.register(fastifyStatic, {
    root: uploadRoot,
    prefix: "/uploads/",
    index: false,
    list: false,
    maxAge: "365d",
    immutable: true,
    setHeaders(reply) {
      reply.header("X-Content-Type-Options", "nosniff");
    },
  });
}
export default fp(storagePlugin, { name: "storage" });
