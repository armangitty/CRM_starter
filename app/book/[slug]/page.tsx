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

const AD_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "campaign_id",
  "campaign_name",
  "adset_id",
  "adset_name",
  "ad_id",
  "ad_name",
] as const;

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const get = (key: string) => {
    const value = query[key];
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
  };
  const fromFacebook = Boolean(
    get("fbclid") ||
      ["facebook", "fb", "meta", "instagram", "ig"].includes(
        get("utm_source").toLowerCase(),
      ) ||
      get("campaign_id") ||
      get("ad_id"),
  );

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id, name, slug, booking_enabled")
    .eq("slug", slug)
    .single();

  if (!account || !account.booking_enabled) notFound();

  if (get("ok")) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">
          {account.name}
        </p>
        <h1 className="font-display mt-3 text-4xl text-foreground">You&apos;re booked</h1>
        <p className="mt-3 text-muted-foreground">
          This call now shows on the company week schedule
          {fromFacebook ? " as a Facebook ad booking" : ""}.
        </p>
      </div>
    );
  }

  const times = slots();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-primary">
        {account.name}
      </p>
      <h1 className="font-display mt-3 text-4xl text-foreground">Book a call</h1>
      <p className="mt-2 text-muted-foreground">
        Pick a day and time. The company sees who booked, when you booked, and
        {fromFacebook
          ? " that this came from a Facebook ad."
          : " the appointment on their week schedule."}
      </p>
      {get("error") ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {get("error")}
        </p>
      ) : null}
      <div className="surface mx-auto mt-8 w-full max-w-lg p-6">
      <form action={createPublicBooking} className="space-y-4">
        <input type="hidden" name="slug" value={slug} />
        {AD_PARAMS.map((name) => (
          <input key={name} type="hidden" name={name} value={get(name)} />
        ))}
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
          <label htmlFor="starts_at">Day and time</label>
          <select id="starts_at" name="starts_at" required>
            {times.map((iso) => (
              <option key={iso} value={iso}>
                {new Date(iso).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="w-full">
          Confirm booked call
        </button>
      </form>
      </div>
    </div>
  );
}
