import { WeekSchedule } from "@/components/week-schedule";
import {
  isFacebookBookingSource,
  type AdAttribution,
} from "@/lib/attribution";
import { loadAgencyScope } from "@/lib/agency";
import { parseWeekOffset, utcRangeForWeek } from "@/lib/schedule";
import type { Booking } from "@/lib/types";

export default async function CalendarsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; from?: string }>;
}) {
  const query = await searchParams;
  const { supabase, accounts } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const names = Object.fromEntries(accounts.map((a) => [a.id, a.name]));
  const weekOffset = parseWeekOffset(query.week);
  const facebookOnly = query.from !== "all";
  const timeZone = accounts[0]?.timezone || "America/New_York";
  const { start, end } = utcRangeForWeek(weekOffset, timeZone);

  const { data: bookings } = ids.length
    ? await supabase
        .from("bookings")
        .select(
          "id, starts_at, ends_at, status, source, created_at, attribution, client_account_id, contacts ( first_name, last_name, email, phone )",
        )
        .in("client_account_id", ids)
        .eq("status", "scheduled")
        .gte("starts_at", start)
        .lte("starts_at", end)
        .order("starts_at")
    : { data: [] };

  const rows = ((bookings ?? []) as Booking[])
    .filter((row) =>
      facebookOnly
        ? isFacebookBookingSource(row.source, row.attribution as AdAttribution)
        : true,
    )
    .map((row) => ({
      ...row,
      account_name: names[row.client_account_id],
    }));

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Booked calls</h1>
      <p className="mt-2 text-muted-foreground">
        Control view of every client&apos;s Facebook-ad booked calls this week:
        who booked, which day and time, and when the booking came in.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-foreground/80">
        {accounts.map((a) => (
          <li key={a.id}>
            {a.name}: send ads to{" "}
            <span className="text-primary">
              /book/{a.slug}?utm_source=facebook
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <WeekSchedule
          bookings={rows}
          timeZone={timeZone}
          weekOffset={weekOffset}
          basePath="/agency/calendars"
          facebookOnly={facebookOnly}
          facebookFilter="opt-out"
          emptyHint="No Facebook booked calls this week. Connect a Page or send ad traffic to a booking link."
        />
      </div>
    </div>
  );
}
