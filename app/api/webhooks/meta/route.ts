import { NextRequest, NextResponse } from "next/server";
import { runWorkflows } from "@/lib/automation";
import { createAdminClient } from "@/lib/supabase/admin";

type LeadValue = { name: string; values: string[] };

function field(values: LeadValue[], names: string[]) {
  const match = values.find((v) =>
    names.includes(v.name.toLowerCase().replace(/\s+/g, "_")),
  );
  return match?.values?.[0] ?? "";
}

async function ingestLead(leadgenId: string, pageId: string) {
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id")
    .eq("facebook_page_id", pageId)
    .maybeSingle();

  if (!account) {
    throw new Error(`No client account mapped to Facebook Page ${pageId}`);
  }

  const { data: secrets } = await admin
    .from("account_secrets")
    .select("meta_page_access_token")
    .eq("client_account_id", account.id)
    .maybeSingle();

  const token = secrets?.meta_page_access_token;
  let firstName = "";
  let lastName = "";
  let email = "";
  let phone = "";
  let raw: unknown = { leadgenId };

  if (token) {
    const graph = await fetch(
      `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${encodeURIComponent(token)}`,
    );
    raw = await graph.json();
    const fieldData = ((raw as { field_data?: LeadValue[] }).field_data ??
      []) as LeadValue[];
    const fullName = field(fieldData, ["full_name", "name"]);
    firstName = field(fieldData, ["first_name", "firstname"]) || fullName.split(" ")[0];
    lastName =
      field(fieldData, ["last_name", "lastname"]) ||
      fullName.split(" ").slice(1).join(" ");
    email = field(fieldData, ["email", "email_address"]);
    phone = field(fieldData, ["phone", "phone_number", "mobile"]);
  }

  const { data: contact } = await admin
    .from("contacts")
    .insert({
      client_account_id: account.id,
      first_name: firstName || "Facebook",
      last_name: lastName || "Lead",
      email: email || null,
      phone: phone || null,
      source: "facebook_lead_ad",
      source_detail: { leadgenId, pageId, graph: raw },
      status: "new",
    })
    .select("id")
    .single();

  if (contact?.id) {
    await runWorkflows(admin, account.id, "contact_created", contact.id);
  }
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    entry?: Array<{
      changes?: Array<{
        field?: string;
        value?: { leadgen_id?: string; page_id?: string };
      }>;
    }>;
  };

  const admin = createAdminClient();
  await admin.from("webhook_events").insert({
    provider: "meta",
    payload,
    processed: false,
  });

  const jobs: Promise<void>[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "leadgen") continue;
      const leadgenId = change.value?.leadgen_id;
      const pageId = change.value?.page_id;
      if (leadgenId && pageId) {
        jobs.push(ingestLead(leadgenId, pageId));
      }
    }
  }

  try {
    await Promise.all(jobs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lead ingest failed";
    await admin
      .from("webhook_events")
      .update({ error: message })
      .eq("provider", "meta")
      .order("created_at", { ascending: false })
      .limit(1);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
