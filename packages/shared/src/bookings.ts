import z from 'zod';
const TSRANGE_RE =
  /^([[(])(?:"((?:[^"\\]|\\.)*)"|([^",]*))?,(?:"((?:[^"\\]|\\.)*)"|([^\])"]*))?([)\]])$/;

function unescapeBound(s: string): string {
  return s.replace(/\\(.)/g, '$1');
}

function normalizeTimestamp(raw: string): string {
  // "2026-08-25 13:51:00+00" -> "2026-08-25T13:51:00+00:00"
  return raw
    .trim()
    .replace(' ', 'T')
    .replace(/([+-]\d{2})(\d{2})?$/, (_, hh, mm) => `${hh}:${mm ?? '00'}`);
}
export function parseTsRangeLiteral(raw: string) {
  if (raw === 'empty') {
    return { start: null, end: null, startInclusive: false, endInclusive: false };
  }
  const m = TSRANGE_RE.exec(raw.trim());
  if (!m) throw new Error(`Unable to parse tstzrange literal: ${raw}`);
  const [, open, sQ, sU, eQ, eU, close] = m;
  const startRaw = sQ !== undefined ? unescapeBound(sQ) : sU;
  const endRaw = eQ !== undefined ? unescapeBound(eQ) : eU;
  return {
    start: startRaw ? new Date(normalizeTimestamp(startRaw)) : null,
    end: endRaw ? new Date(normalizeTimestamp(endRaw)) : null,
    startInclusive: open === '[',
    endInclusive: close === ']',
  };
}

function toTsRangeLiteral(obj: {
  start: Date | null;
  end: Date | null;
  startInclusive: boolean;
  endInclusive: boolean;
}): string {
  const s = obj.start ? obj.start.toISOString() : '';
  const e = obj.end ? obj.end.toISOString() : '';
  return `${obj.startInclusive ? '[' : '('}${s},${e}${obj.endInclusive ? ']' : ')'}`;
}

export const tsRangeSchema = z.codec(
  z.object({
    start: z.date().nullable(),
    end: z.date().nullable(),
    startInclusive: z.boolean(),
    endInclusive: z.boolean(),
  }),
  z.string(),
  {
    decode: toTsRangeLiteral,
    encode: parseTsRangeLiteral,
  },
);
export const bookingRequestSchema = z.object({
  clientId: z.uuid(),

  facilityId: z.uuid(),

  staffMemberId: z.uuid(),
  serviceId: z.uuid(),
  timeRange: tsRangeSchema, // TEMP FIX
});
export type CreateBookingRequest = z.infer<typeof bookingRequestSchema>;
const updateBookingSchema = bookingRequestSchema.partial()
export type UpdateBookingRequest = z.infer<typeof updateBookingSchema>;


// Response DTOs

export const bookingResponseSchema = bookingRequestSchema.extend({
  id: z.uuid(),
  createdAt: z.coerce.date(),
  status: z.enum(['pending', 'confirmed', 'canceled']).default('pending'),
});
export type BookingResponse = z.infer<typeof bookingResponseSchema>;
