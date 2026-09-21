import { redirect } from "next/navigation";
import { ensureAgencyForUser } from "@/lib/provision-agency";
import { createClient } from "@/lib/supabase/server";
import {
  isAgencyRole,
  type ClientAccount,
  type Membership,
  type Organization,
} from "@/lib/types";

export async function getAuthContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, memberships: [] as Membership[] };
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("id, user_id, organization_id, client_account_id, role")
    .eq("user_id", user.id);

  return {
    supabase,
    user,
    memberships: (memberships ?? []) as Membership[],
  };
}

export async function requireAgency() {
  let ctx = await getAuthContext();
  if (!ctx.user) redirect("/login");

  if (!ctx.memberships.find((m) => isAgencyRole(m.role))) {
    const result = await ensureAgencyForUser(ctx.supabase, ctx.user);
    if (result.status === "error") {
      redirect(`/signup?error=${encodeURIComponent(result.message)}`);
    }
    ctx = await getAuthContext();
  }

  const agency = ctx.memberships.find((m) => isAgencyRole(m.role));
  if (!agency) redirect("/portal");

  const { data: organization } = await ctx.supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("id", agency.organization_id)
    .single();

  return {
    ...ctx,
    user: ctx.user,
    agency,
    organization: organization as Organization,
  };
}

export async function requirePortal() {
  const ctx = await getAuthContext();
  if (!ctx.user) redirect("/login");

  const clientMemberships = ctx.memberships.filter(
    (m) => m.client_account_id && !isAgencyRole(m.role),
  );

  if (clientMemberships.length === 0) {
    if (ctx.memberships.some((m) => isAgencyRole(m.role))) {
      redirect("/agency");
    }
    redirect("/login");
  }

  const accountIds = clientMemberships.map((m) => m.client_account_id!);
  const { data: accounts } = await ctx.supabase
    .from("client_accounts")
    .select(
      "id, organization_id, name, slug, industry, timezone, portal_enabled, booking_enabled, facebook_page_id, meta_ad_account_id, created_at",
    )
    .in("id", accountIds);

  return {
    ...ctx,
    user: ctx.user,
    memberships: clientMemberships,
    accounts: (accounts ?? []) as ClientAccount[],
    account: ((accounts ?? [])[0] ?? null) as ClientAccount | null,
  };
}
