import { NextRequest, NextResponse } from "next/server";
import { runWorkflows } from "@/lib/automation";
import { ingestFacebookLead } from "@/lib/facebook-leads";
import { createAdminClient } from "@/lib/supabase/admin";

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
        jobs.push(
          ingestFacebookLead(admin, leadgenId, pageId).then(async (result) => {
            if (result.contactId) {
              await runWorkflows(
                admin,
                result.accountId,
                "contact_created",
                result.contactId,
              );
              if (result.booked) {
                await runWorkflows(
                  admin,
                  result.accountId,
                  "booking_created",
                  result.contactId,
                );
              }
            }
          }),
        );
      }
    }
  }

  try {
    await Promise.all(jobs);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lead ingest failed";
    await admin
      .from("webhook_events")
      .update({ error: message, processed: false })
      .eq("provider", "meta")
      .order("created_at", { ascending: false })
      .limit(1);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }

  await admin
    .from("webhook_events")
    .update({ processed: true })
    .eq("provider", "meta")
    .order("created_at", { ascending: false })
    .limit(1);

  return NextResponse.json({ ok: true });
}
