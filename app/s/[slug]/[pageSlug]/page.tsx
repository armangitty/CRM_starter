import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FunnelPage({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>;
}) {
  const { slug, pageSlug } = await params;
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("client_accounts")
    .select("id, name")
    .eq("slug", slug)
    .single();
  const { data: page } = account
    ? await admin
        .from("funnel_pages")
        .select("headline, body, cta_label, cta_href")
        .eq("client_account_id", account.id)
        .eq("slug", pageSlug)
        .eq("published", true)
        .single()
    : { data: null };
  if (!account || !page) notFound();
  const href = page.cta_href || `/book/${slug}`;

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80">
        {account.name}
      </p>
      <h1 className="font-display mt-4 text-5xl text-white">{page.headline}</h1>
      <p className="mx-auto mt-6 max-w-lg text-lg text-stone-400">{page.body}</p>
      <Link href={href} className="btn mx-auto mt-10">
        {page.cta_label}
      </Link>
    </div>
  );
}
