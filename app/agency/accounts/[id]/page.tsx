import { Flash, Stat } from "@/components/app-shell";
import {
  addManualLead,
  inviteClientUser,
  saveMetaSettings,
} from "@/app/actions/auth";
import { facebookLabel, type AdAttribution } from "@/lib/attribution";
import { requireAgency } from "@/lib/session";
import { notFound } from "next/navigation";
import { bookingContact, type Booking, type Contact } from "@/lib/types";

export default async function AccountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase, organization } = await requireAgency();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data: account } = await supabase
    .from("client_accounts")
    .select(
      "id, name, slug, industry, facebook_page_id, meta_ad_account_id, organization_id",
    )
    .eq("id", id)
    .single();

  if (!account || account.organization_id !== organization.id) notFound();

  const [{ data: contacts }, { data: bookings }, { data: members }] =
    await Promise.all([
      supabase
        .from("contacts")
        .select(
          "id, first_name, last_name, email, phone, source, status, created_at",
        )
        .eq("client_account_id", id)
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("bookings")
        .select(
          "id, starts_at, status, source, created_at, attribution, contacts ( first_name, last_name, email, phone )",
        )
        .eq("client_account_id", id)
        .order("starts_at", { ascending: false })
        .limit(15),
      supabase
        .from("memberships")
        .select("id, role, user_id")
        .eq("client_account_id", id),
    ]);

  const leadList = (contacts ?? []) as Contact[];
  const bookingList = (bookings ?? []) as Booking[];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-primary">
          Sub-account
        </p>
        <h1 className="font-display mt-1 text-4xl text-foreground">{account.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Portal users sign in at /login and see this week&apos;s booked calls.
          Point Facebook ads at{" "}
          <span className="text-primary">
            /book/{account.slug}?utm_source=facebook
          </span>
        </p>
      </div>
      <Flash ok={query.ok} error={query.error} />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Leads" value={leadList.length} hint="Latest 25 shown" />
        <Stat label="Bookings" value={bookingList.length} />
        <Stat label="Portal users" value={members?.length ?? 0} />
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg text-foreground">Issue portal access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Creates a login (email + password) for this company, like a GHL
            user on a location.
          </p>
          <form action={inviteClientUser} className="mt-5 space-y-3">
            <input type="hidden" name="account_id" value={id} />
            <div>
              <label htmlFor="full_name">Name</label>
              <input id="full_name" name="full_name" required />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" minLength={8} required />
            </div>
            <div>
              <label htmlFor="role">Role</label>
              <select id="role" name="role" defaultValue="client_admin">
                <option value="client_admin">Client admin</option>
                <option value="client_user">Client user</option>
              </select>
            </div>
            <button type="submit">Create portal login</button>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg text-foreground">Facebook / Meta ads</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Two ways booked calls show up for this customer: Instant Forms
            (webhook below) and ads that click through to the booking link with
            utm_source=facebook. Use this destination URL in the ad:
          </p>
          <p className="mt-3 break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-primary">
            {`${appUrl}/book/${account.slug}?utm_source=facebook&utm_campaign={{campaign.name}}&utm_content={{ad.name}}`}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Lead Ads webhook:
          </p>
          <p className="mt-2 break-all rounded-lg bg-muted px-3 py-2 font-mono text-xs text-primary">
            {appUrl}/api/webhooks/meta
          </p>
          <form action={saveMetaSettings} className="mt-5 space-y-3">
            <input type="hidden" name="account_id" value={id} />
            <div>
              <label htmlFor="facebook_page_id">Facebook Page ID</label>
              <input
                id="facebook_page_id"
                name="facebook_page_id"
                defaultValue={account.facebook_page_id ?? ""}
              />
            </div>
            <div>
              <label htmlFor="meta_ad_account_id">Ad account ID</label>
              <input
                id="meta_ad_account_id"
                name="meta_ad_account_id"
                defaultValue={account.meta_ad_account_id ?? ""}
              />
            </div>
            <div>
              <label htmlFor="meta_page_access_token">Page access token</label>
              <input
                id="meta_page_access_token"
                name="meta_page_access_token"
                type="password"
                placeholder="Paste to update"
              />
            </div>
            <button type="submit">Save Facebook settings</button>
          </form>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg text-foreground">Add a lead manually</h2>
        <form action={addManualLead} className="mt-4 grid gap-3 md:grid-cols-5">
          <input type="hidden" name="account_id" value={id} />
          <input name="first_name" placeholder="First name" required />
          <input name="last_name" placeholder="Last name" />
          <input name="email" type="email" placeholder="Email" />
          <input name="phone" placeholder="Phone" />
          <button type="submit">Save lead</button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-lg text-foreground">Recent leads</h2>
        <LeadTable rows={leadList} />
      </section>
      <section>
        <h2 className="mb-3 text-lg text-foreground">Booked calls</h2>
        <BookingTable rows={bookingList} />
      </section>
    </div>
  );
}

function LeadTable({ rows }: { rows: Contact[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No leads yet.</p>;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Contact</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="px-4 py-3 text-foreground">
                {row.first_name} {row.last_name}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {row.email ?? row.phone ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{row.source}</td>
              <td className="px-4 py-3 capitalize text-primary">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingTable({ rows }: { rows: Booking[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">No bookings yet.</p>;
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Call</th>
            <th className="px-4 py-3">Who</th>
            <th className="px-4 py-3">From</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="px-4 py-3 text-foreground">
                {new Date(row.starts_at).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {bookingContact(row)
                  ? `${bookingContact(row)!.first_name} ${bookingContact(row)!.last_name}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-primary">
                {facebookLabel(
                  (row.attribution ?? {}) as AdAttribution,
                  row.source,
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
