import { requirePortal } from "@/lib/session";

export default async function PortalReputation() {
  const { supabase, account } = await requirePortal();
  if (!account) return null;
  const { data } = await supabase
    .from("reviews")
    .select("id, author, rating, body")
    .eq("client_account_id", account.id);
  return (
    <div>
      <h1 className="font-display text-4xl text-foreground">Reviews</h1>
      <ul className="mt-6 space-y-3">
        {(data ?? []).map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4 text-foreground">
            {r.author} · {"★".repeat(r.rating)}
            <p className="text-sm text-muted-foreground">{r.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
