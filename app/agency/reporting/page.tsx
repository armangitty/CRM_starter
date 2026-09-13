import { Stat } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";

export default async function ReportingPage() {
  const { supabase, accounts } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const empty = { count: 0 };
  const leads = ids.length
    ? await supabase.from("contacts").select("id", { count: "exact", head: true }).in("client_account_id", ids)
    : empty;
  const booked = ids.length
    ? await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .in("client_account_id", ids)
    : empty;
  const invoices = ids.length
    ? await supabase.from("invoices").select("amount_cents").in("client_account_id", ids)
    : { data: [] };
  const revenue = (invoices.data ?? []).reduce((sum, row) => sum + row.amount_cents, 0);

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Reporting</h1>
      <p className="mt-2 text-stone-400">
        Agency snapshot across every sub-account — leads, appointments, pipeline
        cash.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Stat label="Leads" value={leads.count ?? 0} />
        <Stat label="Bookings" value={booked.count ?? 0} />
        <Stat label="Invoiced" value={`$${(revenue / 100).toFixed(0)}`} />
      </div>
    </div>
  );
}
