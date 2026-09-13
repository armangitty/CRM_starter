import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => ({}));
  const admin = createAdminClient();
  await admin.from("webhook_events").insert({
    provider: "stripe",
    payload,
    processed: true,
  });
  const type = (payload as { type?: string }).type;
  if (type === "invoice.paid") {
    const id = (payload as { data?: { object?: { metadata?: { invoice_id?: string } } } })
      .data?.object?.metadata?.invoice_id;
    if (id) {
      await admin.from("invoices").update({ status: "paid" }).eq("id", id);
    }
  }
  return NextResponse.json({ ok: true });
}
