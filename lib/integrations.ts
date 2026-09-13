export const INTEGRATIONS = [
  { id: "facebook", name: "Facebook / Instagram", group: "Ads & social", hint: "Lead ads, Page inbox, IG DMs" },
  { id: "google_ads", name: "Google Ads", group: "Ads & social", hint: "Lead form extensions and conversions" },
  { id: "google_business", name: "Google Business Profile", group: "Ads & social", hint: "Reviews and messaging" },
  { id: "tiktok", name: "TikTok Ads", group: "Ads & social", hint: "Lead gen forms" },
  { id: "linkedin", name: "LinkedIn Lead Gen", group: "Ads & social", hint: "Sponsored InMail and forms" },
  { id: "stripe", name: "Stripe", group: "Payments", hint: "Invoices, subscriptions, checkout" },
  { id: "twilio", name: "Twilio / LC Phone", group: "Communications", hint: "SMS, MMS, and voice" },
  { id: "mailgun", name: "Mailgun / LC Email", group: "Communications", hint: "Transactional and campaign email" },
  { id: "whatsapp", name: "WhatsApp", group: "Communications", hint: "Cloud API inbox" },
  { id: "google_calendar", name: "Google Calendar", group: "Calendar", hint: "Two-way booking sync" },
  { id: "zoom", name: "Zoom", group: "Calendar", hint: "Auto-create meeting links" },
  { id: "slack", name: "Slack", group: "Ops", hint: "Lead and booking alerts" },
  { id: "zapier", name: "Zapier / webhooks", group: "Ops", hint: "Outbound automation" },
  { id: "shopify", name: "Shopify", group: "Commerce", hint: "Abandoned cart contacts" },
  { id: "quickbooks", name: "QuickBooks", group: "Commerce", hint: "Invoice sync" },
  { id: "openai", name: "Conversation AI", group: "AI", hint: "Inbox copilot and appointment setter" },
] as const;

export type IntegrationId = (typeof INTEGRATIONS)[number]["id"];
