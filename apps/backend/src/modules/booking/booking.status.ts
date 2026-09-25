import type { BookingStatus } from "@slotbook/shared";

export type Actors = "client" | "staff" | "owner";

export const TRANSITIONS: Record<
  BookingStatus,
  Partial<Record<BookingStatus, readonly Actors[]>>
> = {
  pending: { confirmed: ["staff", "owner"], canceled: ["client", "owner", "staff"] },
  confirmed: { canceled: ["client", "owner", "staff"] },
  canceled: {},
};
export type TransitionCheck = "ok" | "invalid" | "forbidden";

export function checkTransition(
  from: BookingStatus,
  to: BookingStatus,
  actors: Actors[],
): TransitionCheck {
  const allowed = TRANSITIONS[from][to];
  if (!allowed) {
    return "invalid";
  }
  return actors.some((actor) => allowed.includes(actor)) ? "ok" : "forbidden";
}
