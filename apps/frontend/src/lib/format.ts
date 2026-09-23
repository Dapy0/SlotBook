export const durationFormatter = new Intl.DurationFormat("en", { style: "narrow" });

export function moneyFormatter(cents: number, currency: string, locale: string = "pl") {
  console.log(currency, locale);
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
  const divisor = 10 ** 2;
  return formatter.format(cents / divisor);
}
export function formatTimeToTimezone(date: string | Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(date));
}
