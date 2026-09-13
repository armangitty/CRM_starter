import { loadAgencyScope } from "@/lib/agency";

export default async function ContactsPage() {
  const { supabase, accounts } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data } = ids.length
    ? await supabase
        .from("contacts")
        .select("id, first_name, last_name, email, phone, source, status, created_at, client_account_id")
        .in("client_account_id", ids)
        .order("created_at", { ascending: false })
    : { data: [] };
  const names = Object.fromEntries(accounts.map((a) => [a.id, a.name]));

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Contacts</h1>
      <p className="mt-2 text-stone-400">
        Every Facebook lead, form fill, and booking lands here across sub-accounts.
      </p>
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-stone-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Sub-account</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">
                  {row.first_name} {row.last_name}
                  <div className="text-xs text-stone-500">{row.email ?? row.phone}</div>
                </td>
                <td className="px-4 py-3 text-stone-400">
                  {names[row.client_account_id]}
                </td>
                <td className="px-4 py-3 text-stone-400">{row.source}</td>
                <td className="px-4 py-3 capitalize text-amber-200">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
