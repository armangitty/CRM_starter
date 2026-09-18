import { createOpportunity } from "@/app/actions/crm";
import { Flash } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const { supabase, accounts, account } = await loadAgencyScope();
  const accountIds = accounts.map((a) => a.id);
  const { data: stages } = accountIds.length
    ? await supabase
        .from("pipeline_stages")
        .select("id, name, position, pipeline_id, pipelines ( client_account_id )")
        .order("position")
    : { data: [] };
  const { data: opps } = accountIds.length
    ? await supabase
        .from("opportunities")
        .select("id, title, value_cents, stage_id, client_account_id, created_at")
        .in("client_account_id", accountIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const columns = (stages ?? []).filter((s) => {
    const p = s.pipelines as { client_account_id?: string } | { client_account_id?: string }[] | null;
    const id = Array.isArray(p) ? p[0]?.client_account_id : p?.client_account_id;
    return accountIds.includes(id ?? "");
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Opportunities</h1>
      <p className="mt-2 text-muted-foreground">
        GHL-style pipeline. New leads can be converted into deals and dragged by
        stage as we grow this board.
      </p>
      <Flash ok={query.ok} error={query.error} />
      {account ? (
        <form action={createOpportunity} className="mt-6 grid gap-3 md:grid-cols-4">
          <input type="hidden" name="account_id" value={account.id} />
          <input name="title" placeholder="Deal name" required />
          <input name="value" type="number" step="0.01" placeholder="Value" />
          <button type="submit">Add deal</button>
        </form>
      ) : (
        <p className="mt-6 text-muted-foreground">Create a sub-account first.</p>
      )}
      <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className="w-64 shrink-0 rounded-2xl border border-border bg-card p-3"
          >
            <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
              {col.name}
            </p>
            {(opps ?? [])
              .filter((o) => o.stage_id === col.id)
              .map((o) => (
                <div
                  key={o.id}
                  className="mb-2 rounded-xl border border-border bg-black/30 p-3"
                >
                  <p className="text-sm text-foreground">{o.title}</p>
                  <p className="text-xs text-primary">
                    ${(o.value_cents / 100).toFixed(0)}
                  </p>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
