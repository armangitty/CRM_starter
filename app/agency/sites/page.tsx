import { loadAgencyScope } from "@/lib/agency";

export default async function SitesPage() {
  const { supabase, accounts } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data: forms } = ids.length
    ? await supabase.from("forms").select("id, name, slug, client_account_id").in("client_account_id", ids)
    : { data: [] };
  const { data: pages } = ids.length
    ? await supabase
        .from("funnel_pages")
        .select("id, name, slug, client_account_id")
        .in("client_account_id", ids)
    : { data: [] };
  const slugs = Object.fromEntries(accounts.map((a) => [a.id, a.slug]));

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Sites & forms</h1>
      <p className="mt-2 text-muted-foreground">
        Funnels for paid traffic and forms that write into the CRM — the GHL Sites
        tab. Chat widget snippet is on each form page.
      </p>
      <h2 className="mt-8 text-lg text-foreground">Forms</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {(forms ?? []).map((f) => (
          <li key={f.id} className="text-foreground/80">
            {f.name}{" "}
            <span className="text-primary">
              /f/{slugs[f.client_account_id]}/{f.slug}
            </span>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-lg text-foreground">Funnels</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {(pages ?? []).map((p) => (
          <li key={p.id} className="text-foreground/80">
            {p.name}{" "}
            <span className="text-primary">
              /s/{slugs[p.client_account_id]}/{p.slug}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
