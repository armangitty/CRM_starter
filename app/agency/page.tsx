import Link from "next/link";
import { Flash, Stat } from "@/components/app-shell";
import { requireAgency } from "@/lib/session";

export default async function AgencyHome({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const params = await searchParams;
  const { supabase, organization } = await requireAgency();
  const { data: accounts } = await supabase
    .from("client_accounts")
    .select(
      "id, name, slug, industry, created_at, facebook_page_id, meta_ad_account_id",
    )
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  const accountIds = (accounts ?? []).map((a) => a.id);
  const { count: leadCount } = accountIds.length
    ? await supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .in("client_account_id", accountIds)
    : { count: 0 };
  const { count: bookingCount } = accountIds.length
    ? await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("client_account_id", accountIds)
        .eq("status", "scheduled")
    : { count: 0 };

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl text-white">Clients</h1>
          <p className="mt-2 text-stone-400">
            Each company is a sub-account with its own leads, ads, and portal.
          </p>
        </div>
        <Link href="/agency/accounts/new" className="btn">
          Add client
        </Link>
      </div>
      <Flash ok={params.ok} error={params.error} />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Stat label="Client accounts" value={accounts?.length ?? 0} />
        <Stat label="Leads captured" value={leadCount ?? 0} />
        <Stat label="Upcoming bookings" value={bookingCount ?? 0} />
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-stone-400">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Industry</th>
              <th className="px-4 py-3 font-medium">Facebook</th>
              <th className="px-4 py-3 font-medium">Portal</th>
            </tr>
          </thead>
          <tbody>
            {(accounts ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-stone-500">
                  No clients yet. Add a company to issue a portal login.
                </td>
              </tr>
            ) : (
              (accounts ?? []).map((account) => (
                <tr key={account.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/agency/accounts/${account.id}`}
                      className="font-medium text-white hover:text-amber-400"
                    >
                      {account.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-stone-400">
                    {account.industry ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-400">
                    {account.facebook_page_id || account.meta_ad_account_id
                      ? "Connected"
                      : "Not connected"}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/book/${account.slug}`}
                      className="text-amber-500 hover:underline"
                    >
                      /book/{account.slug}
                    </Link>
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
