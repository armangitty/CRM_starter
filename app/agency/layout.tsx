import { AppShell } from "@/components/app-shell";
import { requireAgency } from "@/lib/session";

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organization } = await requireAgency();
  return (
    <AppShell
      brand={organization.name}
      subtitle="Agency workspace"
      nav={[
        { href: "/agency", label: "Overview" },
        { href: "/agency/accounts/new", label: "New client" },
      ]}
    >
      {children}
    </AppShell>
  );
}
