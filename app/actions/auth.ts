"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/types";
import { requireAgency } from "@/lib/session";

export async function signUpAgency(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const agencyName = String(formData.get("agency_name") ?? "").trim();

  if (!email || !password || !fullName || !agencyName) {
    redirect("/signup?error=Fill%20in%20all%20fields");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      "/login?error=Confirm%20your%20email%20in%20Supabase%20(or%20disable%20email%20confirmation)%20then%20sign%20in.%20If%20this%20is%20the%20first%20user%2C%20turn%20off%20Confirm%20email%20in%20Auth%20settings%20so%20the%20agency%20can%20be%20created.",
    );
  }

  const { error: rpcError } = await supabase.rpc("create_agency", {
    p_name: agencyName,
    p_slug: slugify(agencyName) || `agency-${Date.now()}`,
  });

  if (rpcError) {
    redirect(`/signup?error=${encodeURIComponent(rpcError.message)}`);
  }

  redirect("/agency");
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (next.startsWith("/")) redirect(next);
  redirect("/agency");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createClientAccount(formData: FormData) {
  const { supabase, organization } = await requireAgency();
  const name = String(formData.get("name") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim();
  if (!name) redirect("/agency/accounts/new?error=Name%20is%20required");

  const { data, error } = await supabase
    .from("client_accounts")
    .insert({
      organization_id: organization.id,
      name,
      slug: slugify(name) || `client-${Date.now()}`,
      industry: industry || null,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/agency/accounts/new?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/agency/accounts/${data.id}`);
}

export async function inviteClientUser(formData: FormData) {
  const { organization } = await requireAgency();
  const accountId = String(formData.get("account_id") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = String(formData.get("role") ?? "client_admin");

  if (!accountId || !email || !fullName || password.length < 8) {
    redirect(
      `/agency/accounts/${accountId}?error=Need%20email%2C%20name%2C%20and%208%2B%20char%20password`,
    );
  }

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id, organization_id")
    .eq("id", accountId)
    .single();

  if (!account || account.organization_id !== organization.id) {
    redirect("/agency?error=Account%20not%20found");
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error || !created.user) {
    redirect(
      `/agency/accounts/${accountId}?error=${encodeURIComponent(error?.message ?? "Could not create user")}`,
    );
  }

  const { error: memberError } = await admin.from("memberships").insert({
    user_id: created.user.id,
    organization_id: organization.id,
    client_account_id: accountId,
    role: role === "client_user" ? "client_user" : "client_admin",
  });

  if (memberError) {
    redirect(
      `/agency/accounts/${accountId}?error=${encodeURIComponent(memberError.message)}`,
    );
  }

  redirect(`/agency/accounts/${accountId}?ok=Portal%20login%20created`);
}

export async function saveMetaSettings(formData: FormData) {
  const { organization } = await requireAgency();
  const accountId = String(formData.get("account_id") ?? "");
  const facebookPageId = String(formData.get("facebook_page_id") ?? "").trim();
  const metaAdAccountId = String(formData.get("meta_ad_account_id") ?? "").trim();
  const pageToken = String(formData.get("meta_page_access_token") ?? "").trim();

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id, organization_id")
    .eq("id", accountId)
    .single();

  if (!account || account.organization_id !== organization.id) {
    redirect("/agency?error=Account%20not%20found");
  }

  await admin
    .from("client_accounts")
    .update({
      facebook_page_id: facebookPageId || null,
      meta_ad_account_id: metaAdAccountId || null,
    })
    .eq("id", accountId);

  if (pageToken) {
    await admin.from("account_secrets").upsert({
      client_account_id: accountId,
      meta_page_access_token: pageToken,
      updated_at: new Date().toISOString(),
    });
  }

  redirect(`/agency/accounts/${accountId}?ok=Facebook%20settings%20saved`);
}

export async function addManualLead(formData: FormData) {
  const { supabase, memberships } = await requireAgency();
  const accountId = String(formData.get("account_id") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const fromPortal = String(formData.get("from_portal") ?? "") === "1";

  const orgId = memberships[0]?.organization_id;
  const { data: account } = await supabase
    .from("client_accounts")
    .select("id, organization_id")
    .eq("id", accountId)
    .single();

  if (!account || account.organization_id !== orgId) {
    redirect("/agency?error=Account%20not%20found");
  }

  const { error } = await supabase.from("contacts").insert({
    client_account_id: accountId,
    first_name: firstName,
    last_name: lastName,
    email: email || null,
    phone: phone || null,
    source: "manual",
    status: "new",
  });

  if (error) {
    const dest = fromPortal
      ? `/portal/leads?error=${encodeURIComponent(error.message)}`
      : `/agency/accounts/${accountId}?error=${encodeURIComponent(error.message)}`;
    redirect(dest);
  }

  redirect(
    fromPortal
      ? "/portal/leads?ok=Lead%20added"
      : `/agency/accounts/${accountId}?ok=Lead%20added`,
  );
}

export async function createPublicBooking(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "");

  if (!slug || !firstName || !email || !startsAt) {
    redirect(`/book/${slug}?error=Fill%20in%20name%2C%20email%2C%20and%20a%20time`);
  }

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id, booking_enabled")
    .eq("slug", slug)
    .single();

  if (!account?.booking_enabled) {
    redirect(`/book/${slug}?error=Booking%20is%20not%20available`);
  }

  const { data: calendar } = await admin
    .from("calendars")
    .select("id, duration_minutes")
    .eq("client_account_id", account.id)
    .limit(1)
    .single();

  const duration = calendar?.duration_minutes ?? 30;
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + duration * 60_000);

  const { data: contact, error: contactError } = await admin
    .from("contacts")
    .insert({
      client_account_id: account.id,
      first_name: firstName,
      last_name: lastName,
      email,
      phone: phone || null,
      source: "booking_page",
      status: "booked",
    })
    .select("id")
    .single();

  if (contactError || !contact) {
    redirect(
      `/book/${slug}?error=${encodeURIComponent(contactError?.message ?? "Could not save contact")}`,
    );
  }

  const { error: bookingError } = await admin.from("bookings").insert({
    client_account_id: account.id,
    calendar_id: calendar?.id ?? null,
    contact_id: contact.id,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    status: "scheduled",
    source: "booking_page",
  });

  if (bookingError) {
    redirect(`/book/${slug}?error=${encodeURIComponent(bookingError.message)}`);
  }

  redirect(`/book/${slug}?ok=1`);
}
