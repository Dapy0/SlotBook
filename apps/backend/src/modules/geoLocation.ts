import geoip from "geoip-lite";
import { findCountriesWithFacilities } from "./facility/facility.repository.ts";
import type { FastifyInstance } from "fastify";
import { geoResponseSchema, countriesResponseSchema } from "@slotbook/shared/geo";

export async function geoRoutes(fastify: FastifyInstance) {
  fastify.get("/geo", { schema: { response: { 200: geoResponseSchema } } }, async (request) => {
    const forwarded = request.headers["x-forwarded-for"]?.toString().split(",")[0];
    const ip = (forwarded ?? request.ip).trim().replace("::ffff:", "");
    return { country: geoip.lookup(ip)?.country ?? null };
  });

  fastify.get(
    "/geo/countries",
    { schema: { response: { 200: countriesResponseSchema } } },
    async () => findCountriesWithFacilities(fastify.drizzle),
  );
}
