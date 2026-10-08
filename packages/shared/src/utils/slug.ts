import slugify from "slugify";
export function slugifyStr(input: string, maxLength = 60): string {
  if (!input) {
    return "";
  }
  return slugify(input, {
    replacement: "-",
    remove: undefined,
    lower: true,
    strict: false,
    locale: "en",
    trim: true,
  }).slice(0, maxLength);
}
