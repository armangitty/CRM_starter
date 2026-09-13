import { requirePortal } from "@/lib/session";

export default async function PortalOpportunities() {
  const { supabase, account } = await requirePortal();
  if (!account) return null;
  const { data } = await supabase
    .from("opportunities")
    .select("id, title, value_cents")
    .eq("client_account_id", account.id);
  return (
    <div>
      <h1 className="font-display text-4xl text-white">Pipeline</h1>
      <ul className="mt-6 space-y-2">
        {(data ?? []).map((o) => (
          <li key={o.id} className="rounded-xl border border-white/5 px-4 py-3 text-white">
            {o.title} · ${(o.value_cents / 100).toFixed(0)}
          </li>
        ))}
      </ul>
    </div>
  );
}
