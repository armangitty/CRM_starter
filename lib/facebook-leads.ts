import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdAttribution } from "@/lib/attribution";

type LeadValue = { name: string; values: string[] };

type GraphLead = {
  created_time?: string;
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  form_id?: string;
  platform?: string;
  field_data?: LeadValue[];
  error?: { message?: string };
};

const TIME_FIELD_NAMES = [
  "appointment_time",
  "appointment",
  "preferred_time",
  "preferred_date_and_time",
  "preferred_date",
  "booking_time",
  "scheduled_time",
  "date_and_time",
  "datetime",
  "when",
  "call_time",
];

export function field(values: LeadValue[], names: string[]) {
  const match = values.find((v) =>
    names.includes(v.name.toLowerCase().replace(/\s+/g, "_")),
  );
  return match?.values?.[0] ?? "";
}

export function parseAppointment(values: LeadValue[]) {
  const combined = field(values, TIME_FIELD_NAMES);
  const fromCombined = parseWhen(combined);
  if (fromCombined) return fromCombined;

  const datePart = field(values, ["date", "preferred_date", "appointment_date"]);
  const timePart = field(values, ["time", "preferred_time", "appointment_time"]);
  if (datePart && timePart) return parseWhen(`${datePart} ${timePart}`);
  if (datePart) return parseWhen(datePart);
  return null;
}

function parseWhen(value: string) {
  if (!value) return null;
  const num = Number(value);
  if (Number.isFinite(num) && num > 1_000_000_000) {
    const ms = num > 1e12 ? num : num * 1000;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function attributionFromGraph(
  pageId: string,
  leadgenId: string,
  graph: GraphLead,
): AdAttribution {
  return {
    channel: "facebook",
    page_id: pageId,
    leadgen_id: leadgenId,
    campaign_id: graph.campaign_id,
    campaign_name: graph.campaign_name,
    adset_id: graph.adset_id,
    adset_name: graph.adset_name,
    ad_id: graph.ad_id,
    ad_name: graph.ad_name,
    form_id: graph.form_id,
    platform: graph.platform,
  };
}

export async function fetchMetaLead(leadgenId: string, token: string) {
  const url = new URL(`https://graph.facebook.com/v21.0/${leadgenId}`);
  url.searchParams.set(
    "fields",
    "created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,field_data,platform",
  );
  url.searchParams.set("access_token", token);
  const graph = await fetch(url);
  return (await graph.json()) as GraphLead;
}

export async function ingestFacebookLead(
  admin: SupabaseClient,
  leadgenId: string,
  pageId: string,
) {
  const { data: account } = await admin
    .from("client_accounts")
    .select("id")
    .eq("facebook_page_id", pageId)
    .maybeSingle();

  if (!account) {
    throw new Error(`No client account mapped to Facebook Page ${pageId}`);
  }

  const { data: existing } = await admin
    .from("contacts")
    .select("id")
    .eq("client_account_id", account.id)
    .eq("source_detail->>leadgenId", leadgenId)
    .maybeSingle();

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
  let graph: GraphLead = {};
  let appointment: Date | null = null;

  if (token) {
    graph = await fetchMetaLead(leadgenId, token);
    const fieldData = graph.field_data ?? [];
    const fullName = field(fieldData, ["full_name", "name"]);
    firstName =
      field(fieldData, ["first_name", "firstname"]) || fullName.split(" ")[0];
    lastName =
      field(fieldData, ["last_name", "lastname"]) ||
      fullName.split(" ").slice(1).join(" ");
    email = field(fieldData, ["email", "email_address"]);
    phone = field(fieldData, ["phone", "phone_number", "mobile"]);
    appointment = parseAppointment(fieldData);
  }

  const attribution = attributionFromGraph(pageId, leadgenId, graph);
  const sourceDetail = { leadgenId, pageId, graph, attribution };
  const booked = Boolean(appointment);
  let contactId = existing?.id as string | undefined;

  if (contactId) {
    await admin
      .from("contacts")
      .update({
        first_name: firstName || "Facebook",
        last_name: lastName || "Lead",
        email: email || null,
        phone: phone || null,
        source: "facebook_lead_ad",
        source_detail: sourceDetail,
        status: booked ? "booked" : "new",
      })
      .eq("id", contactId);
  } else {
    const { data: contact, error } = await admin
      .from("contacts")
      .insert({
        client_account_id: account.id,
        first_name: firstName || "Facebook",
        last_name: lastName || "Lead",
        email: email || null,
        phone: phone || null,
        source: "facebook_lead_ad",
        source_detail: sourceDetail,
        status: booked ? "booked" : "new",
      })
      .select("id")
      .single();
    if (error || !contact) {
      throw new Error(error?.message ?? "Could not save Facebook lead");
    }
    contactId = contact.id;
  }

  if (appointment && contactId) {
    const { data: calendar } = await admin
      .from("calendars")
      .select("id, duration_minutes")
      .eq("client_account_id", account.id)
      .limit(1)
      .maybeSingle();
    const duration = calendar?.duration_minutes ?? 30;
    const end = new Date(appointment.getTime() + duration * 60_000);

    const { data: existingBooking } = await admin
      .from("bookings")
      .select("id")
      .eq("contact_id", contactId)
      .eq("source", "facebook_lead_ad")
      .maybeSingle();

    const row = {
      client_account_id: account.id,
      calendar_id: calendar?.id ?? null,
      contact_id: contactId,
      starts_at: appointment.toISOString(),
      ends_at: end.toISOString(),
      status: "scheduled",
      source: "facebook_lead_ad",
      attribution,
    };

    if (existingBooking) {
      await admin.from("bookings").update(row).eq("id", existingBooking.id);
    } else {
      await admin.from("bookings").insert(row);
    }
  }

  return { accountId: account.id, contactId, booked };
}
