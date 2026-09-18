import { Flash } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";

export default async function AutomationPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const { supabase, accounts } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data: workflows } = ids.length
    ? await supabase
        .from("workflows")
        .select("id, name, trigger, enabled, client_account_id")
        .in("client_account_id", ids)
    : { data: [] };
  const { data: runs } = ids.length
    ? await supabase
        .from("workflow_runs")
        .select("id, status, created_at, log, workflow_id")
        .order("created_at", { ascending: false })
        .limit(20)
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Automation</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Each new sub-account gets a speed-to-lead workflow: tag, task, SMS, email.
        Triggers: contact created, form submitted, booking created, campaign sent.
      </p>
      <Flash ok={query.ok} error={query.error} />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {(workflows ?? []).map((w) => (
          <div key={w.id} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-foreground">{w.name}</p>
            <p className="mt-1 text-xs uppercase text-muted-foreground">
              {w.trigger} · {w.enabled ? "on" : "off"}
            </p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 text-lg text-foreground">Recent runs</h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {(runs ?? []).map((r) => (
          <li key={r.id}>
            {new Date(r.created_at).toLocaleString()} — {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
