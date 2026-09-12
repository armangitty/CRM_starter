import { Flash } from "@/components/app-shell";
import { addPortalLead } from "@/app/actions/portal";
import { requirePortal } from "@/lib/session";
import type { Contact } from "@/lib/types";

export default async function PortalLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const query = await searchParams;
  const { supabase, account } = await requirePortal();
  if (!account) return null;

  const { data } = await supabase
    .from("contacts")
    .select(
      "id, first_name, last_name, email, phone, source, status, created_at",
    )
    .eq("client_account_id", account.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Contact[];

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Leads</h1>
      <p className="mt-2 text-stone-400">
        Facebook Lead Ads arrive with source <code>facebook_lead_ad</code>.
        Booking-page contacts show as <code>booking_page</code>.
      </p>
      <Flash ok={query.ok} error={query.error} />
      <form
        action={addPortalLead}
        className="mt-6 grid gap-3 rounded-2xl border border-white/5 bg-[#141b24] p-4 md:grid-cols-5"
      >
        <input name="first_name" placeholder="First name" required />
        <input name="last_name" placeholder="Last name" />
        <input name="email" type="email" placeholder="Email" />
        <input name="phone" placeholder="Phone" />
        <button type="submit">Add lead</button>
      </form>
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-stone-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email / phone</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stone-500">
                  No leads yet. Run ads or share the booking page.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="px-4 py-3 text-stone-400">
                    {row.email ?? row.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-400">{row.source}</td>
                  <td className="px-4 py-3 capitalize text-amber-200">
                    {row.status}
                  </td>
                  <td className="px-4 py-3 text-stone-500">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
