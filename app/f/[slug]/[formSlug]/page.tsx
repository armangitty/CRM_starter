import { submitPublicForm } from "@/app/actions/crm";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; formSlug: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { slug, formSlug } = await params;
  const query = await searchParams;
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id, name")
    .eq("slug", slug)
    .single();
  const { data: form } = account
    ? await admin
        .from("forms")
        .select("id, name")
        .eq("client_account_id", account.id)
        .eq("slug", formSlug)
        .single()
    : { data: null };
  if (!account || !form) notFound();

  if (query.ok) {
    return (
      <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 text-center">
        <h1 className="font-display text-4xl text-white">Got it</h1>
        <p className="mt-3 text-stone-400">You are in {account.name}&apos;s CRM.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80">
        {account.name}
      </p>
      <h1 className="font-display mt-3 text-4xl text-white">{form.name}</h1>
      {query.error ? (
        <p className="mt-4 text-sm text-red-200">{query.error}</p>
      ) : null}
      <form action={submitPublicForm} className="mt-8 space-y-4">
        <input type="hidden" name="account_slug" value={slug} />
        <input type="hidden" name="form_slug" value={formSlug} />
        <input name="first_name" placeholder="First name" required />
        <input name="last_name" placeholder="Last name" />
        <input name="email" type="email" placeholder="Email" required />
        <input name="phone" placeholder="Phone" />
        <button type="submit" className="w-full">
          Submit
        </button>
      </form>
    </div>
  );
}
