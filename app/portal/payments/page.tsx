import { requirePortal } from "@/lib/session";

export default async function PortalPayments() {
  const { supabase, account } = await requirePortal();
  if (!account) return null;
  const { data } = await supabase
    .from("invoices")
    .select("id, amount_cents, status")
    .eq("client_account_id", account.id);
  return (
    <div>
      <h1 className="font-display text-4xl text-white">Invoices</h1>
      <ul className="mt-6 space-y-2 text-white">
        {(data ?? []).map((i) => (
          <li key={i.id}>
            ${(i.amount_cents / 100).toFixed(2)} · {i.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
