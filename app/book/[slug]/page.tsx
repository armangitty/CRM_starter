import { createPublicBooking } from "@/app/actions/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

function slots(days = 10) {
  const out: string[] = [];
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  for (let d = 0; d < days; d += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + d);
    for (const hour of [9, 10, 11, 13, 14, 15, 16]) {
      const slot = new Date(day);
      slot.setHours(hour, 0, 0, 0);
      if (slot.getTime() > Date.now()) out.push(slot.toISOString());
    }
  }
  return out.slice(0, 24);
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id, name, slug, booking_enabled")
    .eq("slug", slug)
    .single();

  if (!account || !account.booking_enabled) notFound();

  if (query.ok) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80">
          {account.name}
        </p>
        <h1 className="font-display mt-3 text-4xl text-white">You&apos;re booked</h1>
        <p className="mt-3 text-stone-400">
          This appointment now shows in the company portal.
        </p>
      </div>
    );
  }

  const times = slots();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80">
        {account.name}
      </p>
      <h1 className="font-display mt-3 text-4xl text-white">Book an appointment</h1>
      <p className="mt-2 text-stone-400">
        Pick a time. Your details are sent to the {account.name} portal as a
        booked lead.
      </p>
      {query.error ? (
        <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {query.error}
        </p>
      ) : null}
      <form action={createPublicBooking} className="mt-8 space-y-4">
        <input type="hidden" name="slug" value={slug} />
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="first_name">First name</label>
            <input id="first_name" name="first_name" required />
          </div>
          <div>
            <label htmlFor="last_name">Last name</label>
            <input id="last_name" name="last_name" />
          </div>
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" />
        </div>
        <div>
          <label htmlFor="starts_at">Time</label>
          <select id="starts_at" name="starts_at" required>
            {times.map((iso) => (
              <option key={iso} value={iso}>
                {new Date(iso).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full">
          Confirm booking
        </button>
      </form>
    </div>
  );
}
