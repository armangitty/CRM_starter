import { Flash } from "@/components/app-shell";
import { addPortalLead } from "@/app/actions/portal";
import { facebookLabel, type AdAttribution } from "@/lib/attribution";
import { requirePortal } from "@/lib/session";
import type { Contact } from "@/lib/types";

function contactAttribution(row: Contact) {
  const detail = row.source_detail ?? {};
  return (detail.attribution ?? detail) as AdAttribution;
}

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
      "id, first_name, last_name, email, phone, source, source_detail, status, created_at",
    )
    .eq("client_account_id", account.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Contact[];

  return (
    <div>
      <h1 className="font-display text-4xl tracking-tight">Contacts</h1>
      <p className="mt-2 text-muted-foreground">
        People who came in from Facebook Lead Ads or your Facebook booking link.
        When they book a call, it also lands on this week&apos;s schedule.
      </p>
      <Flash ok={query.ok} error={query.error} />
      <form
        action={addPortalLead}
        className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-5"
      >
        <input name="first_name" placeholder="First name" required />
        <input name="last_name" placeholder="Last name" />
        <input name="email" type="email" placeholder="Email" />
        <input name="phone" placeholder="Phone" />
        <button type="submit">Add lead</button>
      </form>
      <div className="mt-8 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Who</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">From Facebook</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No leads yet. Connect the Facebook Page on the agency side, or
                  send traffic to the booking link.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">
                    {row.first_name} {row.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.email ?? row.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {facebookLabel(contactAttribution(row), row.source)}
                  </td>
                  <td className="px-4 py-3 capitalize text-primary">
                    {row.status}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
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
