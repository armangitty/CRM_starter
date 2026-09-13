import { requirePortal } from "@/lib/session";

export default async function PortalConversations() {
  const { supabase, account } = await requirePortal();
  if (!account) return null;
  const { data: threads } = await supabase
    .from("conversations")
    .select("id, channel, last_message_at")
    .eq("client_account_id", account.id)
    .order("last_message_at", { ascending: false });
  return (
    <div>
      <h1 className="font-display text-4xl text-white">Inbox</h1>
      <p className="mt-2 text-stone-400">Messages for this location.</p>
      <ul className="mt-6 space-y-2">
        {(threads ?? []).map((t) => (
          <li key={t.id} className="rounded-xl border border-white/5 px-4 py-3 capitalize text-white">
            {t.channel}
          </li>
        ))}
      </ul>
    </div>
  );
}
