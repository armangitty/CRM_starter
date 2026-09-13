import { addReview } from "@/app/actions/crm";
import { Flash } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";

export default async function ReputationPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const query = await searchParams;
  const { supabase, accounts, account } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data: reviews } = ids.length
    ? await supabase
        .from("reviews")
        .select("id, author, rating, body, source, created_at")
        .in("client_account_id", ids)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Reputation</h1>
      <p className="mt-2 text-stone-400">
        Google Business and Facebook reviews. Connect GBP on Integrations to sync
        automatically.
      </p>
      <Flash ok={query.ok} />
      {account ? (
        <form action={addReview} className="mt-6 grid gap-3 md:grid-cols-4">
          <input type="hidden" name="account_id" value={account.id} />
          <input name="author" placeholder="Author" required />
          <input name="rating" type="number" min={1} max={5} defaultValue={5} />
          <input name="body" placeholder="Review" />
          <button type="submit">Log review</button>
        </form>
      ) : null}
      <ul className="mt-8 space-y-3">
        {(reviews ?? []).map((r) => (
          <li key={r.id} className="rounded-2xl border border-white/5 p-4">
            <p className="text-white">
              {r.author} · {"★".repeat(r.rating)}
            </p>
            <p className="mt-1 text-sm text-stone-400">{r.body}</p>
            <p className="mt-1 text-xs uppercase text-stone-600">{r.source}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
