export const durationFormatter = new Intl.DurationFormat("en", { style: "narrow" });

export function moneyFormatterFromCents(cents: number, currency: string, locale: string = "pl") {
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
export function formatDateToTimezone(date: string | Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    dateStyle: "long",
  }).format(new Date(date));
}

export function formatCutoff(minutes: number): string {
  let phrase;
  if (minutes <= 0) {
    phrase = "Free cancellation any time before start";
  } else if (minutes <= 60) {
    phrase = "Free cancellation up to 1 hour before";
  } else {
    phrase = "Free cancellation up to 24 hours before";
  }
  return phrase;
}

export function formatDeadline(date: string | Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
