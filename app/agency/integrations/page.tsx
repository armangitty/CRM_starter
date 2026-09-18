import { saveIntegration } from "@/app/actions/crm";
import { Flash } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";
import { INTEGRATIONS } from "@/lib/integrations";

export default async function IntegrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const { supabase, organization, accounts } = await loadAgencyScope();
  const { data: connections } = await supabase
    .from("integration_connections")
    .select("provider, status, config")
    .eq("organization_id", organization.id);
  const status = Object.fromEntries(
    (connections ?? []).map((c) => [c.provider, c.status]),
  );

  const groups = [...new Set(INTEGRATIONS.map((i) => i.group))];

  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Integrations</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Same idea as GoHighLevel&apos;s app marketplace: connect ads, inbox,
        calendar, payments, and AI per agency. Keys stay in integration_secrets
        (service role only).
      </p>
      <Flash ok={query.ok} error={query.error} />
      {groups.map((group) => (
        <section key={group} className="mt-10">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">{group}</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {INTEGRATIONS.filter((i) => i.group === group).map((item) => (
              <form
                key={item.id}
                action={saveIntegration}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-foreground">{item.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${
                      status[item.id] === "connected"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {status[item.id] === "connected" ? "connected" : "off"}
                  </span>
                </div>
                <input type="hidden" name="provider" value={item.id} />
                {accounts[0] ? (
                  <input type="hidden" name="account_id" value={accounts[0].id} />
                ) : null}
                <input
                  className="mt-3"
                  name="external_id"
                  placeholder="Account / Page / SID"
                />
                <input
                  className="mt-2"
                  name="api_key"
                  type="password"
                  placeholder="API key or token"
                />
                <button type="submit" className="mt-3">
                  Save
                </button>
              </form>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
