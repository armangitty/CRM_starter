import Link from "next/link";
import {
  facebookLabel,
  isFacebookBookingSource,
  personName,
  type AdAttribution,
} from "@/lib/attribution";
import {
  dateKey,
  formatInZone,
  monthDay,
  weekDateKeys,
  weekdayLong,
} from "@/lib/schedule";
import { bookingContact } from "@/lib/types";

export type ScheduledCall = {
  id: string;
  starts_at: string;
  ends_at: string;
  created_at: string;
  source: string;
  status: string;
  attribution?: AdAttribution | Record<string, unknown> | null;
  client_account_id?: string;
  account_name?: string;
  contacts?:
    | {
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
      }
    | {
        first_name: string;
        last_name: string;
        email: string | null;
        phone: string | null;
      }[]
    | null;
};

export function WeekSchedule({
  bookings,
  timeZone,
  weekOffset,
  basePath,
  facebookOnly,
  facebookFilter,
  emptyHint,
}: {
  bookings: ScheduledCall[];
  timeZone: string;
  weekOffset: number;
  basePath: string;
  facebookOnly?: boolean;
  facebookFilter?: "opt-in" | "opt-out";
  emptyHint?: string;
}) {
  const days = weekDateKeys(weekOffset, timeZone);
  const today = dateKey(new Date(), timeZone);
  const byDay = new Map<string, ScheduledCall[]>();
  for (const key of days) byDay.set(key, []);
  for (const booking of bookings) {
    const key = dateKey(booking.starts_at, timeZone);
    if (!byDay.has(key)) continue;
    byDay.get(key)!.push(booking);
  }

  const href = (offset: number, facebook = facebookOnly) => {
    const params = new URLSearchParams();
    if (offset) params.set("week", String(offset));
    if (facebook) params.set("from", "facebook");
    else if (facebookFilter === "opt-out") params.set("from", "all");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Link
            href={href(weekOffset - 1)}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
          >
            Previous week
          </Link>
          <Link
            href={href(0)}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
          >
            This week
          </Link>
          <Link
            href={href(weekOffset + 1)}
            className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
          >
            Next week
          </Link>
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href={href(weekOffset, false)}
            className={`rounded-full px-3 py-1.5 ${
              facebookOnly
                ? "border border-border text-muted-foreground"
                : "bg-primary/10 text-primary"
            }`}
          >
            All booked calls
          </Link>
          <Link
            href={href(weekOffset, true)}
            className={`rounded-full px-3 py-1.5 ${
              facebookOnly
                ? "bg-primary/10 text-primary"
                : "border border-border text-muted-foreground"
            }`}
          >
            Facebook ads only
          </Link>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {monthDay(days[0], timeZone)} – {monthDay(days[6], timeZone)}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-7">
        {days.map((key) => {
          const items = byDay.get(key) ?? [];
          return (
            <div
              key={key}
              className={`min-h-48 rounded-2xl border p-3 ${
                key === today
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {weekdayLong(key, timeZone)}
              </p>
              <p className="mt-1 text-sm">{monthDay(key, timeZone)}</p>
              <div className="mt-3 space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No calls</p>
                ) : (
                  items.map((booking) => {
                    const attribution = (booking.attribution ??
                      {}) as AdAttribution;
                    const who = personName(bookingContact(booking));
                    const facebook = isFacebookBookingSource(
                      booking.source,
                      attribution,
                    );
                    return (
                      <article
                        key={booking.id}
                        className="rounded-xl border border-border bg-muted/40 p-2.5"
                      >
                        <p className="text-sm font-medium">
                          {formatInZone(booking.starts_at, timeZone, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="mt-1 text-sm text-primary">{who}</p>
                        {booking.account_name ? (
                          <p className="text-xs text-muted-foreground">
                            {booking.account_name}
                          </p>
                        ) : null}
                        <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                          Booked{" "}
                          {formatInZone(booking.created_at, timeZone, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                          {facebook ? "From Facebook · " : ""}
                          {facebookLabel(attribution, booking.source).replace(
                            /^Facebook · /,
                            "",
                          )}
                        </p>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
      {bookings.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {emptyHint ?? "No booked calls in this week yet."}
        </p>
      ) : null}
    </div>
  );
}
