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
        { href: "/portal", label: "Schedule" },
        { href: "/portal/leads", label: "Contacts", section: "CRM" },
        { href: "/portal/bookings", label: "Booked calls", section: "CRM" },
        { href: "/portal/conversations", label: "Conversations", section: "CRM" },
        { href: "/portal/opportunities", label: "Pipeline", section: "CRM" },
        { href: "/portal/sites", label: "Forms & funnels", section: "Marketing" },
        { href: "/portal/reputation", label: "Reputation", section: "Marketing" },
        { href: "/portal/payments", label: "Invoices", section: "Billing" },
      ]}
    >
      {children}
    </AppShell>
  );
}
