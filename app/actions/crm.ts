"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { runWorkflows } from "@/lib/automation";
import { requireAgency, requirePortal } from "@/lib/session";

async function ownedAccount(accountId: string) {
  const { organization } = await requireAgency();
  const admin = createAdminClient();
  const { data } = await admin
    .from("client_accounts")
    .select("id, organization_id")
    .eq("id", accountId)
    .single();
  if (!data || data.organization_id !== organization.id) {
    redirect("/agency?error=Account%20not%20found");
  }
  return { admin, organization, accountId };
}

export async function sendMessage(formData: FormData) {
  const { supabase } = await requireAgency();
  const conversationId = String(formData.get("conversation_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const next = String(formData.get("next") ?? "/agency/conversations");
  if (!conversationId || !body) redirect(`${next}?error=Message%20required`);
  const { data: convo } = await supabase
    .from("conversations")
    .select("id, channel")
    .eq("id", conversationId)
    .single();
  if (!convo) redirect(`${next}?error=Thread%20missing`);
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "out",
    channel: convo.channel,
    body,
  });
  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString(), unread: false })
    .eq("id", conversationId);
  redirect(`${next}?ok=Sent`);
}

export async function moveOpportunity(formData: FormData) {
  await requireAgency();
  const id = String(formData.get("id") ?? "");
  const stageId = String(formData.get("stage_id") ?? "");
  const next = String(formData.get("next") ?? "/agency/opportunities");
  const supabase = (await requireAgency()).supabase;
  await supabase.from("opportunities").update({ stage_id: stageId }).eq("id", id);
  redirect(`${next}?ok=Moved`);
}

export async function createOpportunity(formData: FormData) {
  const { supabase } = await requireAgency();
  const accountId = String(formData.get("account_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const contactId = String(formData.get("contact_id") ?? "") || null;
  const value = Math.round(Number(formData.get("value") ?? 0) * 100);
  const { data: pipeline } = await supabase
    .from("pipelines")
    .select("id")
    .eq("client_account_id", accountId)
    .limit(1)
    .single();
  const { data: stage } = pipeline
    ? await supabase
        .from("pipeline_stages")
        .select("id")
        .eq("pipeline_id", pipeline.id)
        .order("position")
        .limit(1)
        .single()
    : { data: null };
  await supabase.from("opportunities").insert({
    client_account_id: accountId,
    contact_id: contactId,
    pipeline_id: pipeline?.id ?? null,
    stage_id: stage?.id ?? null,
    title: title || "New opportunity",
    value_cents: Number.isFinite(value) ? value : 0,
  });
  redirect("/agency/opportunities?ok=Opportunity%20added");
}

export async function createCampaign(formData: FormData) {
  const { supabase } = await requireAgency();
  const accountId = String(formData.get("account_id") ?? "");
  await supabase.from("campaigns").insert({
    client_account_id: accountId,
    channel: String(formData.get("channel") ?? "email"),
    name: String(formData.get("name") ?? "Campaign"),
    subject: String(formData.get("subject") ?? ""),
    body: String(formData.get("body") ?? ""),
    status: "draft",
  });
  redirect("/agency/marketing?ok=Campaign%20saved");
}

export async function sendCampaign(formData: FormData) {
  const { admin, accountId } = await ownedAccount(
    String(formData.get("account_id") ?? ""),
  );
  const campaignId = String(formData.get("campaign_id") ?? "");
  const { data: campaign } = await admin
    .from("campaigns")
    .select("id, body, channel, subject")
    .eq("id", campaignId)
    .single();
  const { data: contacts } = await admin
    .from("contacts")
    .select("id")
    .eq("client_account_id", accountId)
    .limit(200);
  for (const contact of contacts ?? []) {
    await admin.from("campaign_sends").insert({
      campaign_id: campaignId,
      contact_id: contact.id,
    });
    await runWorkflows(admin, accountId, "campaign_sent", contact.id);
  }
  await admin
    .from("campaigns")
    .update({ status: "sent" })
    .eq("id", campaignId);
  void campaign;
  redirect(`/agency/marketing?ok=Sent%20to%20${contacts?.length ?? 0}%20contacts`);
}

export async function saveIntegration(formData: FormData) {
  const { organization } = await requireAgency();
  const admin = createAdminClient();
  const provider = String(formData.get("provider") ?? "");
  const accountId = String(formData.get("account_id") ?? "") || null;
  const apiKey = String(formData.get("api_key") ?? "").trim();
  const externalId = String(formData.get("external_id") ?? "").trim();
  if (!provider) redirect("/agency/integrations?error=Pick%20a%20provider");

  let query = admin
    .from("integration_connections")
    .select("id")
    .eq("organization_id", organization.id)
    .eq("provider", provider);
  query = accountId
    ? query.eq("client_account_id", accountId)
    : query.is("client_account_id", null);
  const { data: existing } = await query.maybeSingle();

  let connectionId = existing?.id as string | undefined;
  if (connectionId) {
    await admin
      .from("integration_connections")
      .update({
        status: apiKey ? "connected" : "disconnected",
        config: { external_id: externalId },
        updated_at: new Date().toISOString(),
      })
      .eq("id", connectionId);
  } else {
    const { data } = await admin
      .from("integration_connections")
      .insert({
        organization_id: organization.id,
        client_account_id: accountId,
        provider,
        status: apiKey ? "connected" : "disconnected",
        config: { external_id: externalId },
      })
      .select("id")
      .single();
    connectionId = data?.id;
  }

  if (connectionId && apiKey) {
    await admin.from("integration_secrets").upsert({
      connection_id: connectionId,
      payload: { api_key: apiKey },
      updated_at: new Date().toISOString(),
    });
  }
  redirect("/agency/integrations?ok=Connection%20saved");
}

export async function createInvoice(formData: FormData) {
  const { supabase } = await requireAgency();
  await supabase.from("invoices").insert({
    client_account_id: String(formData.get("account_id") ?? ""),
    amount_cents: Math.round(Number(formData.get("amount") ?? 0) * 100),
    status: "open",
  });
  redirect("/agency/payments?ok=Invoice%20created");
}

export async function addReview(formData: FormData) {
  const { supabase } = await requireAgency();
  await supabase.from("reviews").insert({
    client_account_id: String(formData.get("account_id") ?? ""),
    author: String(formData.get("author") ?? "Customer"),
    rating: Number(formData.get("rating") ?? 5),
    body: String(formData.get("body") ?? ""),
    source: String(formData.get("source") ?? "google"),
  });
  redirect("/agency/reputation?ok=Review%20logged");
}

export async function saveWhiteLabel(formData: FormData) {
  const { supabase, organization } = await requireAgency();
  await supabase
    .from("organizations")
    .update({
      brand_color: String(formData.get("brand_color") ?? "#c4a574"),
      logo_url: String(formData.get("logo_url") ?? "") || null,
      custom_domain: String(formData.get("custom_domain") ?? "") || null,
      support_email: String(formData.get("support_email") ?? "") || null,
      white_label_enabled: formData.get("white_label_enabled") === "on",
    })
    .eq("id", organization.id);
  redirect("/agency/settings?ok=Branding%20saved");
}

export async function submitPublicForm(formData: FormData) {
  const accountSlug = String(formData.get("account_slug") ?? "");
  const formSlug = String(formData.get("form_slug") ?? "");
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id")
    .eq("slug", accountSlug)
    .single();
  const { data: form } = account
    ? await admin
        .from("forms")
        .select("id")
        .eq("client_account_id", account.id)
        .eq("slug", formSlug)
        .single()
    : { data: null };
  if (!account || !form) redirect(`/f/${accountSlug}/${formSlug}?error=Form%20not%20found`);

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { data: contact } = await admin
    .from("contacts")
    .insert({
      client_account_id: account.id,
      first_name: firstName || "Website",
      last_name: lastName,
      email: email || null,
      phone: phone || null,
      source: "form",
      status: "new",
    })
    .select("id")
    .single();

  await admin.from("form_submissions").insert({
    form_id: form.id,
    contact_id: contact?.id ?? null,
    payload: { firstName, lastName, email, phone },
  });
  if (contact?.id) {
    await runWorkflows(admin, account.id, "contact_created", contact.id);
    await runWorkflows(admin, account.id, "form_submitted", contact.id);
  }
  redirect(`/f/${accountSlug}/${formSlug}?ok=1`);
}

export async function createTask(formData: FormData) {
  const portal = String(formData.get("portal") ?? "") === "1";
  const supabase = portal
    ? (await requirePortal()).supabase
    : (await requireAgency()).supabase;
  const accountId = portal
    ? (await requirePortal()).account?.id
    : String(formData.get("account_id") ?? "");
  if (!accountId) redirect("/agency?error=No%20account");
  await supabase.from("tasks").insert({
    client_account_id: accountId,
    title: String(formData.get("title") ?? "Follow up"),
  });
  redirect(portal ? "/portal?ok=Task%20added" : "/agency/conversations?ok=Task%20added");
}

export async function createMembershipPlan(formData: FormData) {
  const { supabase } = await requireAgency();
  await supabase.from("membership_plans").insert({
    client_account_id: String(formData.get("account_id") ?? ""),
    name: String(formData.get("name") ?? "Members"),
    amount_cents: Math.round(Number(formData.get("amount") ?? 0) * 100),
  });
  redirect("/agency/memberships?ok=Plan%20created");
}
