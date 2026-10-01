import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { expireUnconfirmedBookings } from "../modules/booking/booking.repository";

async function bookingExpiry(fastify: FastifyInstance) {
  const INTERVAL_MS = 5 * 60_000;

  const run = async () => {
    try {
      const updatedNum = await expireUnconfirmedBookings(fastify.drizzle, new Date());
      if (updatedNum > 0) {
        fastify.log.info({ updatedNum }, "expired bookings");
      }
    } catch (error) {
      fastify.log.error(error, "failed to expire bookings");
    }
  };
  fastify.addHook("onReady", async () => {
    await run();
  });

  const timer = setInterval(() => {
    void run();
  }, INTERVAL_MS);

  timer.unref();

  fastify.addHook("onClose", async () => clearInterval(timer));
}
export default fp(bookingExpiry, {
  name: "bookingExpiry",
  dependencies: ["fastify-drizzle"],
});
