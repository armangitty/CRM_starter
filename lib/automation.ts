import type { SupabaseClient } from "@supabase/supabase-js";

type Admin = SupabaseClient;

async function logOutbound(
  admin: Admin,
  accountId: string,
  contactId: string,
  channel: string,
  body: string,
) {
  const { data: existing } = await admin
    .from("conversations")
    .select("id")
    .eq("client_account_id", accountId)
    .eq("contact_id", contactId)
    .eq("channel", channel)
    .maybeSingle();

  let conversationId = existing?.id as string | undefined;
  if (!conversationId) {
    const { data } = await admin
      .from("conversations")
      .insert({
        client_account_id: accountId,
        contact_id: contactId,
        channel,
        subject: channel,
        unread: false,
      })
      .select("id")
      .single();
    conversationId = data?.id;
  }
  if (!conversationId) return;
  await admin.from("messages").insert({
    conversation_id: conversationId,
    direction: "out",
    channel,
    body,
  });
  await admin
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function runWorkflows(
  admin: Admin,
  accountId: string,
  trigger: string,
  contactId: string,
) {
  const { data: workflows } = await admin
    .from("workflows")
    .select("id, name")
    .eq("client_account_id", accountId)
    .eq("trigger", trigger)
    .eq("enabled", true);

  for (const workflow of workflows ?? []) {
    const log: string[] = [];
    const { data: steps } = await admin
      .from("workflow_steps")
      .select("action, config, position")
      .eq("workflow_id", workflow.id)
      .order("position");

    for (const step of steps ?? []) {
      const config = (step.config ?? {}) as Record<string, string>;
      if (step.action === "add_tag" && config.tag) {
        const { data: tag } = await admin
          .from("tags")
          .select("id")
          .eq("client_account_id", accountId)
          .eq("name", config.tag)
          .maybeSingle();
        let tagId = tag?.id;
        if (!tagId) {
          const created = await admin
            .from("tags")
            .insert({ client_account_id: accountId, name: config.tag })
            .select("id")
            .single();
          tagId = created.data?.id;
        }
        if (tagId) {
          await admin
            .from("contact_tags")
            .upsert({ contact_id: contactId, tag_id: tagId });
          log.push(`Tagged ${config.tag}`);
        }
      }
      if (step.action === "create_task") {
        await admin.from("tasks").insert({
          client_account_id: accountId,
          contact_id: contactId,
          title: config.title || "Follow up",
        });
        log.push("Created task");
      }
      if (step.action === "send_sms") {
        await logOutbound(
          admin,
          accountId,
          contactId,
          "sms",
          config.body || "Thanks for reaching out.",
        );
        log.push("Queued SMS");
      }
      if (step.action === "send_email") {
        await logOutbound(
          admin,
          accountId,
          contactId,
          "email",
          `${config.subject ?? "Hello"}\n\n${config.body ?? ""}`,
        );
        log.push("Queued email");
      }
    }

    await admin.from("workflow_runs").insert({
      workflow_id: workflow.id,
      contact_id: contactId,
      status: "completed",
      log,
    });
  }
}
