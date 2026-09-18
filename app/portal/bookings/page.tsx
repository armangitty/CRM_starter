import { WeekSchedule } from "@/components/week-schedule";
import {
  facebookLabel,
  isFacebookBookingSource,
  personName,
  type AdAttribution,
} from "@/lib/attribution";
import { formatInZone, parseWeekOffset, utcRangeForWeek } from "@/lib/schedule";
import { requirePortal } from "@/lib/session";
import { bookingContact, type Booking } from "@/lib/types";

export default async function PortalBookingsPage({
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

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, starts_at, ends_at, status, source, created_at, attribution, contacts ( first_name, last_name, email, phone )",
    )
    .eq("client_account_id", account.id)
    .order("starts_at", { ascending: false });

  const rows = ((data ?? []) as Booking[]).filter((row) =>
    facebookOnly
      ? isFacebookBookingSource(row.source, row.attribution as AdAttribution)
      : true,
  );
  const weekRows = rows.filter((row) => {
    const t = new Date(row.starts_at).getTime();
    return t >= new Date(start).getTime() && t <= new Date(end).getTime();
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Booked calls</h1>
      <p className="mt-2 text-muted-foreground">
        Week view of scheduled calls. Each card shows the person, the call time,
        when they booked, and the Facebook ad if they came from ads.
      </p>
      <div className="mt-8">
        <WeekSchedule
          bookings={weekRows}
          timeZone={timeZone}
          weekOffset={weekOffset}
          basePath="/portal/bookings"
          facebookOnly={facebookOnly}
          facebookFilter="opt-out"
        />
      </div>
      <div className="mt-10 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Call</th>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">Booked at</th>
              <th className="px-4 py-3">From</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No booked calls yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const who = bookingContact(row);
                const attribution = (row.attribution ?? {}) as AdAttribution;
                return (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3 text-foreground">
                      {formatInZone(row.starts_at, timeZone, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {personName(who)}
                      <div className="text-xs text-muted-foreground">
                        {who?.email ?? who?.phone ?? ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatInZone(row.created_at, timeZone, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-primary">
                      {facebookLabel(attribution, row.source)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
