const JST_TIMEZONE = "Asia/Tokyo";

const jstDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JST_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const jstDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JST_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const jstMonthFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JST_TIMEZONE,
  month: "short",
});

const jstMonthYearFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: JST_TIMEZONE,
  year: "numeric",
  month: "short",
});

export function formatJstDate(date: Date) {
  return jstDateFormatter.format(date);
}

export function formatJstDateTime(date: Date) {
  return jstDateTimeFormatter.format(date);
}

export function formatJstMonth(date: Date) {
  return jstMonthFormatter.format(date);
}

export function formatJstMonthYear(date: Date) {
  return jstMonthYearFormatter.format(date);
}

export function formatUtcDateKey(year: number, month: number, day: number) {
  const monthText = `${month}`.padStart(2, "0");
  const dayText = `${day}`.padStart(2, "0");
  return `${year}-${monthText}-${dayText}`;
}
