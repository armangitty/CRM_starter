import { loadAgencyScope } from "@/lib/agency";

export default async function CalendarsPage() {
  const { supabase, accounts } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data: bookings } = ids.length
    ? await supabase
        .from("bookings")
        .select("id, starts_at, status, client_account_id, contacts ( first_name, last_name )")
        .in("client_account_id", ids)
        .order("starts_at")
        .limit(40)
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Calendars</h1>
      <p className="mt-2 text-stone-400">
        Round-robin and Google Calendar sync connect from Integrations. Public
        booking links live on each sub-account.
      </p>
      <ul className="mt-6 space-y-2 text-sm text-stone-300">
        {accounts.map((a) => (
          <li key={a.id}>
            {a.name}: <span className="text-amber-400">/book/{a.slug}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-stone-400">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((b) => (
              <tr key={b.id} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">
                  {new Date(b.starts_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 capitalize text-amber-200">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
