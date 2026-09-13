import { requirePortal } from "@/lib/session";

export default async function PortalSites() {
  const { supabase, account } = await requirePortal();
  if (!account) return null;
  const { data: forms } = await supabase
    .from("forms")
    .select("name, slug")
    .eq("client_account_id", account.id);
  const { data: pages } = await supabase
    .from("funnel_pages")
    .select("name, slug")
    .eq("client_account_id", account.id);
  return (
    <div>
      <h1 className="font-display text-4xl text-white">Forms & funnels</h1>
      <ul className="mt-6 space-y-2 text-sm text-stone-300">
        {(forms ?? []).map((f) => (
          <li key={f.slug}>
            Form: /f/{account.slug}/{f.slug}
          </li>
        ))}
        {(pages ?? []).map((p) => (
          <li key={p.slug}>
            Funnel: /s/{account.slug}/{p.slug}
          </li>
        ))}
      </ul>
    </div>
  );
}
