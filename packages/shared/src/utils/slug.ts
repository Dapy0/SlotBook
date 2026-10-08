import slugify from "slugify";
export function slugifyStr(input: string, maxLength = 60): string {
  if (!input) {
    return "";
  }
  return slugify(input, {
    replacement: "-",
    lower: true,
    strict: false,
    trim: true,
  }).slice(0, maxLength);
}
