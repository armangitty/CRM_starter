import { createInvoice } from "@/app/actions/crm";
import { Flash } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const query = await searchParams;
  const { supabase, accounts, account } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data: invoices } = ids.length
    ? await supabase
        .from("invoices")
        .select("id, amount_cents, status, created_at")
        .in("client_account_id", ids)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Payments</h1>
      <p className="mt-2 text-muted-foreground">
        Invoices and subscriptions. Stripe webhook: /api/webhooks/stripe
      </p>
      <Flash ok={query.ok} />
      {account ? (
        <form action={createInvoice} className="mt-6 flex gap-3">
          <input type="hidden" name="account_id" value={account.id} />
          <input name="amount" type="number" step="0.01" placeholder="Amount" required />
          <button type="submit">Create invoice</button>
        </form>
      ) : null}
      <table className="mt-8 w-full text-left text-sm">
        <thead className="text-muted-foreground">
          <tr>
            <th className="py-2">Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {(invoices ?? []).map((i) => (
            <tr key={i.id} className="border-t border-border text-foreground">
              <td className="py-3">${(i.amount_cents / 100).toFixed(2)}</td>
              <td className="capitalize text-primary">{i.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
