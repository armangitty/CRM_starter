import { AppShell } from "@/components/app-shell";
import { requirePortal } from "@/lib/session";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { account } = await requirePortal();
  return (
    <AppShell
      brand={account?.name ?? "Portal"}
      subtitle="Client portal"
      nav={[
        { href: "/portal", label: "Home" },
        { href: "/portal/leads", label: "Leads" },
        { href: "/portal/bookings", label: "Bookings" },
      ]}
    >
      {children}
    </AppShell>
  );
}
