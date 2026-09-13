import { sendMessage } from "@/app/actions/crm";
import { Flash } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";

export default async function ConversationsPage({
  searchParams,
}: {
  searchParams: Promise<{ thread?: string; ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const { supabase, accounts } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data: threads } = ids.length
    ? await supabase
        .from("conversations")
        .select("id, channel, subject, last_message_at, unread, contact_id")
        .in("client_account_id", ids)
        .order("last_message_at", { ascending: false })
    : { data: [] };
  const activeId = query.thread ?? threads?.[0]?.id;
  const { data: messages } = activeId
    ? await supabase
        .from("messages")
        .select("id, direction, body, created_at, channel")
        .eq("conversation_id", activeId)
        .order("created_at")
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Conversations</h1>
      <p className="mt-2 text-stone-400">
        Unified inbox for SMS, email, Facebook, Instagram, WhatsApp, and chat.
        Outbound sends log here until Twilio / Mailgun / Meta are connected.
      </p>
      <Flash ok={query.ok} error={query.error} />
      <div className="mt-6 grid min-h-[480px] overflow-hidden rounded-2xl border border-white/5 md:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/5 bg-[#10151c]">
          {(threads ?? []).length === 0 ? (
            <p className="p-4 text-sm text-stone-500">
              No threads yet. New leads start a conversation when automations run.
            </p>
          ) : (
            (threads ?? []).map((t) => (
              <a
                key={t.id}
                href={`/agency/conversations?thread=${t.id}`}
                className={`block border-b border-white/5 px-4 py-3 text-sm ${
                  t.id === activeId ? "bg-white/5 text-white" : "text-stone-300"
                }`}
              >
                <p className="capitalize">{t.channel}</p>
                <p className="truncate text-xs text-stone-500">
                  {t.subject ?? "Conversation"}
                </p>
              </a>
            ))
          )}
        </aside>
        <section className="flex flex-col bg-[#141b24]">
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {(messages ?? []).map((m) => (
              <div
                key={m.id}
                className={`max-w-lg rounded-2xl px-4 py-2 text-sm ${
                  m.direction === "out"
                    ? "ml-auto bg-amber-500/20 text-amber-50"
                    : "bg-white/5 text-stone-200"
                }`}
              >
                {m.body}
              </div>
            ))}
          </div>
          {activeId ? (
            <form action={sendMessage} className="flex gap-2 border-t border-white/5 p-4">
              <input type="hidden" name="conversation_id" value={activeId} />
              <input type="hidden" name="next" value={`/agency/conversations?thread=${activeId}`} />
              <input name="body" placeholder="Reply…" required />
              <button type="submit">Send</button>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}
