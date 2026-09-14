import z from "zod";

export const isoDateSchema = z.codec(z.iso.datetime(), z.date(), {
  decode: (s) => new Date(s),
  encode: (d) => d.toISOString(),
});
export const wallTimeSchema = z.iso.time({ precision: -1 });
export type WallTime = z.infer<typeof wallTimeSchema>;
