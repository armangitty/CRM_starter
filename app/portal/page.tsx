import { Stat } from "@/components/app-shell";
import { WeekSchedule } from "@/components/week-schedule";
import {
  isFacebookBookingSource,
  type AdAttribution,
} from "@/lib/attribution";
import { parseWeekOffset, utcRangeForWeek } from "@/lib/schedule";
import { requirePortal } from "@/lib/session";
import type { Booking } from "@/lib/types";
import Link from "next/link";

const BOOKING_SELECT =
  "id, starts_at, ends_at, status, source, created_at, attribution, contacts ( first_name, last_name, email, phone )";

export default async function PortalHome({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; from?: string }>;
}) {
  const query = await searchParams;
  const { supabase, account } = await requirePortal();
  if (!account) return null;

  const weekOffset = parseWeekOffset(query.week);
  const facebookOnly = query.from !== "all";
  const timeZone = account.timezone || "America/New_York";
  const { start, end } = utcRangeForWeek(weekOffset, timeZone);

  const [{ count: leads }, { count: facebookLeads }, { data: weekRows }] =
    await Promise.all([
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", account.id),
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", account.id)
        .in("source", ["facebook_lead_ad", "facebook_ad"]),
      supabase
        .from("bookings")
        .select(BOOKING_SELECT)
        .eq("client_account_id", account.id)
        .eq("status", "scheduled")
        .gte("starts_at", start)
        .lte("starts_at", end)
        .order("starts_at"),
    ]);

  const bookings = ((weekRows ?? []) as Booking[]).filter((row) =>
    facebookOnly
      ? isFacebookBookingSource(row.source, row.attribution as AdAttribution)
      : true,
  );

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">Your upcoming conversations</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Calls booked from your Facebook ads show here by day and time, with who
        booked and which ad they came from.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat label="Facebook leads" value={facebookLeads ?? 0} />
        <Stat label="All leads" value={leads ?? 0} />
        <Stat label="Calls this week" value={bookings.length} />
      </div>
      <div className="mt-8">
        <WeekSchedule
          bookings={bookings}
          timeZone={timeZone}
          weekOffset={weekOffset}
          basePath="/portal"
          facebookOnly={facebookOnly}
          facebookFilter="opt-out"
          emptyHint="No booked calls this week from Facebook ads. Instant Forms with a time, or your ad booking link, will appear here."
        />
      </div>
      <div className="mt-10 flex gap-4">
        <Link href="/portal/leads" className="btn">
          Facebook leads
        </Link>
        <Link
          href="/portal/bookings"
          className="rounded-full border border-border px-5 py-3 text-sm"
        >
          All booked calls
        </Link>
      </div>
    </div>
  );
}
