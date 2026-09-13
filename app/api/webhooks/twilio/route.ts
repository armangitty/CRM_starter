import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runWorkflows } from "@/lib/automation";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const params = new URLSearchParams(body);
  const from = params.get("From") ?? "";
  const text = params.get("Body") ?? "";
  const admin = createAdminClient();
  await admin.from("webhook_events").insert({
    provider: "twilio",
    payload: { from, text },
    processed: true,
  });

  const { data: contact } = await admin
    .from("contacts")
    .select("id, client_account_id")
    .eq("phone", from)
    .limit(1)
    .maybeSingle();

  if (contact) {
    const { data: convo } = await admin
      .from("conversations")
      .insert({
        client_account_id: contact.client_account_id,
        contact_id: contact.id,
        channel: "sms",
        subject: from,
      })
      .select("id")
      .single();
    if (convo) {
      await admin.from("messages").insert({
        conversation_id: convo.id,
        direction: "in",
        channel: "sms",
        body: text,
      });
    }
    await runWorkflows(admin, contact.client_account_id, "sms_received", contact.id);
  }

  return new NextResponse("<Response></Response>", {
    headers: { "Content-Type": "text/xml" },
  });
}
