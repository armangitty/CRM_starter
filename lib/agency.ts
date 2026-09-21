import type { User } from "@supabase/supabase-js";
import type { createClient } from "@/lib/supabase/server";
import { isAgencyRole, slugify, type Membership } from "@/lib/types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export async function ensureAgencyForUser(
  supabase: Supabase,
  user: User,
) {
  const { data: memberships } = await supabase
    .from("memberships")
    .select("id, user_id, organization_id, client_account_id, role")
    .eq("user_id", user.id);

  const rows = (memberships ?? []) as Membership[];
  if (rows.some((m) => isAgencyRole(m.role))) {
    return { status: "agency" as const };
  }
  if (rows.some((m) => m.client_account_id)) {
    return { status: "portal" as const };
  }

  const agencyName = String(user.user_metadata?.agency_name ?? "").trim();
  if (!agencyName) {
    return { status: "needs_signup" as const };
  }

  const baseSlug = slugify(agencyName) || `agency-${Date.now()}`;
  const { error } = await supabase.rpc("create_agency", {
    p_name: agencyName,
    p_slug: `${baseSlug}-${user.id.slice(0, 8)}`,
  });

  if (error) {
    return { status: "error" as const, message: error.message };
  }

  return { status: "agency" as const };
}

export function destinationForWorkspace(
  status: "agency" | "portal" | "needs_signup" | "error",
) {
  if (status === "agency") return "/agency";
  if (status === "portal") return "/portal";
  return "/signup";
}
