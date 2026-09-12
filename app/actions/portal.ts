"use server";

import { redirect } from "next/navigation";
import { requirePortal } from "@/lib/session";

export async function addPortalLead(formData: FormData) {
  const { supabase, account } = await requirePortal();
  if (!account) redirect("/login");

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { error } = await supabase.from("contacts").insert({
    client_account_id: account.id,
    first_name: firstName,
    last_name: lastName,
    email: email || null,
    phone: phone || null,
    source: "manual",
    status: "new",
  });

  if (error) {
    redirect(`/portal/leads?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/portal/leads?ok=Lead%20added");
}
