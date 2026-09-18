import { createMembershipPlan } from "@/app/actions/crm";
import { Flash } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";

export default async function MembershipsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const query = await searchParams;
  const { supabase, accounts, account } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data: plans } = ids.length
    ? await supabase.from("membership_plans").select("id, name, amount_cents").in("client_account_id", ids)
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Memberships</h1>
      <p className="mt-2 text-muted-foreground">
        Course / community access products. Stripe billing attaches from Integrations.
      </p>
      <Flash ok={query.ok} />
      {account ? (
        <form action={createMembershipPlan} className="mt-6 flex gap-3">
          <input type="hidden" name="account_id" value={account.id} />
          <input name="name" placeholder="Plan name" required />
          <input name="amount" type="number" step="0.01" placeholder="Price" />
          <button type="submit">Add plan</button>
        </form>
      ) : null}
      <ul className="mt-8 space-y-2">
        {(plans ?? []).map((p) => (
          <li key={p.id} className="rounded-xl border border-border px-4 py-3 text-foreground">
            {p.name} — ${(p.amount_cents / 100).toFixed(0)}/mo
          </li>
        ))}
      </ul>
    </div>
  );
}
