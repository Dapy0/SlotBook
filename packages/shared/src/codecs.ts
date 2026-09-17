import z from "zod";

export const instantSchema = z.codec(z.iso.datetime(), z.date(), {
  decode: (s) => new Date(s),
  encode: (d) => d.toISOString(),
});
export const calendarDateSchema = z.iso.date();
export const wallTimeSchema = z.iso.time({ precision: 0 });
export type WallTime = z.infer<typeof wallTimeSchema>;
