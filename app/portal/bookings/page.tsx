import { requirePortal } from "@/lib/session";
import { bookingContact, type Booking } from "@/lib/types";

export default async function PortalBookingsPage() {
  const { supabase, account } = await requirePortal();
  if (!account) return null;

  const { data } = await supabase
    .from("bookings")
    .select(
      "id, starts_at, ends_at, status, source, contacts ( first_name, last_name, email, phone )",
    )
    .eq("client_account_id", account.id)
    .order("starts_at", { ascending: false });

  const rows = (data ?? []) as Booking[];

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Bookings</h1>
      <p className="mt-2 text-stone-400">
        Appointments booked from your public page appear here for your team.
      </p>
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/5">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-stone-400">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-stone-500">
                  No appointments yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">
                    {new Date(row.starts_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-stone-300">
                    {bookingContact(row)
                      ? `${bookingContact(row)!.first_name} ${bookingContact(row)!.last_name}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-stone-400">
                    {bookingContact(row)?.email ??
                      bookingContact(row)?.phone ??
                      "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-amber-200">
                    {row.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
