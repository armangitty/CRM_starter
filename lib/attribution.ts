export type AdAttribution = {
  channel?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  form_id?: string;
  page_id?: string;
  leadgen_id?: string;
  platform?: string;
};

const FACEBOOK_SOURCES = new Set([
  "facebook",
  "fb",
  "meta",
  "instagram",
  "ig",
  "facebook_ad",
  "facebook_lead_ad",
  "fbclid",
]);

export function isFacebookAttribution(a: AdAttribution | null | undefined) {
  if (!a) return false;
  const source = (a.utm_source || a.channel || "").toLowerCase();
  if (FACEBOOK_SOURCES.has(source)) return true;
  if (a.fbclid || a.campaign_id || a.ad_id || a.leadgen_id || a.page_id) {
    return true;
  }
  return false;
}

export function isFacebookBookingSource(source: string, attribution?: AdAttribution | null) {
  if (source === "facebook_ad" || source === "facebook_lead_ad") return true;
  return isFacebookAttribution(attribution);
}

export function attributionFromForm(formData: FormData): AdAttribution {
  const pick = (key: string) => String(formData.get(key) ?? "").trim();
  const raw: AdAttribution = {
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_content: pick("utm_content"),
    utm_term: pick("utm_term"),
    fbclid: pick("fbclid"),
    campaign_id: pick("campaign_id"),
    campaign_name: pick("campaign_name") || pick("utm_campaign"),
    adset_id: pick("adset_id"),
    adset_name: pick("adset_name"),
    ad_id: pick("ad_id"),
    ad_name: pick("ad_name") || pick("utm_content"),
  };
  const cleaned = Object.fromEntries(
    Object.entries(raw).filter(([, value]) => Boolean(value)),
  ) as AdAttribution;
  if (isFacebookAttribution(cleaned)) {
    cleaned.channel = "facebook";
  }
  return cleaned;
}

export function facebookLabel(attribution?: AdAttribution | null, source?: string) {
  if (!isFacebookBookingSource(source ?? "", attribution)) {
    if (source === "booking_page") return "Booking page";
    if (source === "manual") return "Manual";
    return source || "Unknown";
  }
  const campaign =
    attribution?.campaign_name ||
    attribution?.utm_campaign ||
    attribution?.campaign_id;
  const ad = attribution?.ad_name || attribution?.utm_content || attribution?.ad_id;
  if (campaign && ad) return `Facebook · ${campaign} · ${ad}`;
  if (campaign) return `Facebook · ${campaign}`;
  if (ad) return `Facebook · ${ad}`;
  if (source === "facebook_lead_ad") return "Facebook Lead Ad";
  return "Facebook ad";
}

export function personName(
  contact?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null,
) {
  if (!contact) return "Unknown";
  return `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() || "Unknown";
}
