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
      <h1 className="font-display text-4xl text-foreground">Conversations</h1>
      <p className="mt-2 text-muted-foreground">
        Unified inbox for SMS, email, Facebook, Instagram, WhatsApp, and chat.
        Outbound sends log here until Twilio / Mailgun / Meta are connected.
      </p>
      <Flash ok={query.ok} error={query.error} />
      <div className="mt-6 grid min-h-[480px] overflow-hidden rounded-2xl border border-border md:grid-cols-[280px_1fr]">
        <aside className="border-r border-border bg-sidebar">
          {(threads ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No threads yet. New leads start a conversation when automations run.
            </p>
          ) : (
            (threads ?? []).map((t) => (
              <a
                key={t.id}
                href={`/agency/conversations?thread=${t.id}`}
                className={`block border-b border-border px-4 py-3 text-sm ${
                  t.id === activeId ? "bg-muted text-foreground" : "text-foreground/80"
                }`}
              >
                <p className="capitalize">{t.channel}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.subject ?? "Conversation"}
                </p>
              </a>
            ))
          )}
        </aside>
        <section className="flex flex-col bg-card">
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {(messages ?? []).map((m) => (
              <div
                key={m.id}
                className={`max-w-lg rounded-2xl px-4 py-2 text-sm ${
                  m.direction === "out"
                    ? "ml-auto bg-primary/15 text-primary"
                    : "bg-muted text-foreground"
                }`}
              >
                {m.body}
              </div>
            ))}
          </div>
          {activeId ? (
            <form action={sendMessage} className="flex gap-2 border-t border-border p-4">
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
