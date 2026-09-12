import { Stat } from "@/components/app-shell";
import { requirePortal } from "@/lib/session";
import Link from "next/link";

export default async function PortalHome() {
  const { supabase, account } = await requirePortal();
  if (!account) return null;

  const [{ count: leads }, { count: booked }, { count: upcoming }] =
    await Promise.all([
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", account.id),
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", account.id)
        .eq("status", "booked"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("client_account_id", account.id)
        .eq("status", "scheduled"),
    ]);

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Welcome back</h1>
      <p className="mt-2 max-w-2xl text-stone-400">
        This is your company portal. New Facebook leads and appointment
        bookings from your ads and booking page show up here automatically.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat label="Leads" value={leads ?? 0} />
        <Stat label="Booked contacts" value={booked ?? 0} />
        <Stat label="Upcoming appointments" value={upcoming ?? 0} />
      </div>
      <div className="mt-10 flex gap-4">
        <Link href="/portal/leads" className="btn">
          View leads
        </Link>
        <Link
          href={`/book/${account.slug}`}
          className="rounded-full border border-white/10 px-5 py-3 text-sm"
        >
          Public booking page
        </Link>
      </div>
    </div>
  );
}
