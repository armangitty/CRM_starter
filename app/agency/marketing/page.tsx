import { createCampaign, sendCampaign } from "@/app/actions/crm";
import { Flash } from "@/components/app-shell";
import { loadAgencyScope } from "@/lib/agency";

export default async function MarketingPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const query = await searchParams;
  const { supabase, accounts, account } = await loadAgencyScope();
  const ids = accounts.map((a) => a.id);
  const { data: campaigns } = ids.length
    ? await supabase
        .from("campaigns")
        .select("id, name, channel, status, created_at, client_account_id")
        .in("client_account_id", ids)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-4xl text-white">Email & SMS</h1>
      <p className="mt-2 text-stone-400">
        Campaigns queue through Mailgun and Twilio once those integrations are
        connected. Sends still record in Conversations.
      </p>
      <Flash ok={query.ok} error={query.error} />
      {account ? (
        <form action={createCampaign} className="mt-6 space-y-3 rounded-2xl border border-white/5 bg-[#141b24] p-5">
          <input type="hidden" name="account_id" value={account.id} />
          <div className="grid gap-3 md:grid-cols-3">
            <input name="name" placeholder="Campaign name" required />
            <select name="channel" defaultValue="email">
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
            <input name="subject" placeholder="Subject (email)" />
          </div>
          <textarea name="body" rows={4} placeholder="Message body" required />
          <button type="submit">Save campaign</button>
        </form>
      ) : null}
      <div className="mt-8 space-y-3">
        {(campaigns ?? []).map((c) => (
          <form
            key={c.id}
            action={sendCampaign}
            className="flex items-center justify-between rounded-xl border border-white/5 px-4 py-3"
          >
            <input type="hidden" name="account_id" value={c.client_account_id} />
            <input type="hidden" name="campaign_id" value={c.id} />
            <div>
              <p className="text-white">{c.name}</p>
              <p className="text-xs uppercase text-stone-500">
                {c.channel} · {c.status}
              </p>
            </div>
            <button type="submit">Send</button>
          </form>
        ))}
      </div>
    </div>
  );
}
