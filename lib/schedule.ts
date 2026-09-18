export function dateKey(value: string | Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function addDaysKey(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day + days));
  return dt.toISOString().slice(0, 10);
}

function weekdayIndex(value: Date, timeZone: string) {
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(value);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(label);
}

export function weekDateKeys(weekOffset: number, timeZone: string) {
  const todayKey = dateKey(new Date(), timeZone);
  const [year, month, day] = todayKey.split("-").map(Number);
  const todayUtc = new Date(Date.UTC(year, month - 1, day));
  const index = weekdayIndex(todayUtc, "UTC");
  const mondayShift = index === 0 ? -6 : 1 - index;
  const monday = addDaysKey(todayKey, mondayShift + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => addDaysKey(monday, i));
}

export function formatInZone(
  value: string | Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-US", { timeZone, ...options }).format(
    new Date(value),
  );
}

export function weekdayLong(key: string, timeZone: string) {
  const [year, month, day] = key.split("-").map(Number);
  return formatInZone(new Date(Date.UTC(year, month - 1, day, 12)), timeZone, {
    weekday: "long",
  });
}

export function monthDay(key: string, timeZone: string) {
  const [year, month, day] = key.split("-").map(Number);
  return formatInZone(new Date(Date.UTC(year, month - 1, day, 12)), timeZone, {
    month: "short",
    day: "numeric",
  });
}

export function parseWeekOffset(value?: string) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export function utcRangeForWeek(weekOffset: number, timeZone: string) {
  const days = weekDateKeys(weekOffset, timeZone);
  const [year, month, day] = days[0].split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day - 1));
  const [y2, m2, d2] = days[6].split("-").map(Number);
  const end = new Date(Date.UTC(y2, m2 - 1, d2 + 2));
  return { days, start: start.toISOString(), end: end.toISOString() };
}
