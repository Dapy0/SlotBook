export const durationFormatter = new Intl.DurationFormat("en", { style: "narrow" });

export function moneyFormatter(cents: number, currency: string, locale: string = "pl") {
  console.log(currency,locale);
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
  const divisor = 10 ** 2;
  return formatter.format(cents / divisor);
}
