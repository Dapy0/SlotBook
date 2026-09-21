import geoip from "geoip-lite";
import { findCountriesWithFacilities } from "./facility/facility.repository.ts";
import { geoCountryResponseSchema, geoResponseSchema } from "@slotbook/shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const geoRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.get("/geo", { schema: { response: { 200: geoResponseSchema } } }, async (request) => {
    const forwarded = request.headers["x-forwarded-for"]?.toString().split(",")[0];
    const ip = (forwarded ?? request.ip).trim().replace("::ffff:", "");
    return { country: geoip.lookup(ip)?.country ?? null };
  });

  fastify.get(
    "/geo/countries",
    { schema: { response: { 200: geoCountryResponseSchema.array() } } },
    async () => findCountriesWithFacilities(fastify.drizzle),
  );
};
