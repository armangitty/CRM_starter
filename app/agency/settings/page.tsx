import { saveWhiteLabel } from "@/app/actions/crm";
import { Flash } from "@/components/app-shell";
import { requireAgency } from "@/lib/session";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const query = await searchParams;
  const { supabase, organization } = await requireAgency();
  const { data: org } = await supabase
    .from("organizations")
    .select("logo_url, brand_color, custom_domain, support_email, white_label_enabled")
    .eq("id", organization.id)
    .single();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-4xl text-foreground">SaaS / white label</h1>
      <p className="mt-2 text-muted-foreground">
        Rebrand the portal like GHL Agency Pro / SaaS mode. Point a custom domain
        at this Vercel project after DNS is ready.
      </p>
      <Flash ok={query.ok} />
      <form action={saveWhiteLabel} className="mt-8 space-y-4">
        <div>
          <label htmlFor="brand_color">Brand color</label>
          <input
            id="brand_color"
            name="brand_color"
            defaultValue={org?.brand_color ?? "#c4a574"}
          />
        </div>
        <div>
          <label htmlFor="logo_url">Logo URL</label>
          <input id="logo_url" name="logo_url" defaultValue={org?.logo_url ?? ""} />
        </div>
        <div>
          <label htmlFor="custom_domain">Custom domain</label>
          <input
            id="custom_domain"
            name="custom_domain"
            placeholder="app.youragency.com"
            defaultValue={org?.custom_domain ?? ""}
          />
        </div>
        <div>
          <label htmlFor="support_email">Support email</label>
          <input
            id="support_email"
            name="support_email"
            type="email"
            defaultValue={org?.support_email ?? ""}
          />
        </div>
        <label className="flex items-center gap-2 normal-case tracking-normal text-foreground/80">
          <input
            type="checkbox"
            name="white_label_enabled"
            defaultChecked={Boolean(org?.white_label_enabled)}
            className="h-4 w-4"
          />
          Hide Leadport branding for clients
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
