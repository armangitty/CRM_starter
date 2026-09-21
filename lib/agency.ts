import { requireAgency } from "@/lib/session";
import type { ClientAccount } from "@/lib/types";

export async function loadAgencyScope() {
  const ctx = await requireAgency();
  const { data } = await ctx.supabase
    .from("client_accounts")
    .select(
      "id, organization_id, name, slug, industry, timezone, portal_enabled, booking_enabled, facebook_page_id, meta_ad_account_id, created_at",
    )
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });
  const accounts = (data ?? []) as ClientAccount[];
  return { ...ctx, accounts, account: accounts[0] ?? null };
}
