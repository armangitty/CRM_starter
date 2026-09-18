import { AppShell } from "@/components/app-shell";
import { requireAgency } from "@/lib/session";

const nav = [
  { href: "/agency", label: "Clients" },
  { href: "/agency/calendars", label: "Booked calls", section: "CRM" },
  { href: "/agency/contacts", label: "Facebook leads", section: "CRM" },
  { href: "/agency/conversations", label: "Conversations", section: "CRM" },
  { href: "/agency/opportunities", label: "Opportunities", section: "CRM" },
  { href: "/agency/payments", label: "Payments", section: "CRM" },
  { href: "/agency/marketing", label: "Email / SMS", section: "Marketing" },
  { href: "/agency/automation", label: "Automation", section: "Marketing" },
  { href: "/agency/sites", label: "Sites & forms", section: "Marketing" },
  { href: "/agency/memberships", label: "Memberships", section: "Marketing" },
  { href: "/agency/reputation", label: "Reputation", section: "Marketing" },
  { href: "/agency/reporting", label: "Reporting", section: "Insights" },
  { href: "/agency/accounts/new", label: "Sub-accounts", section: "Agency" },
  { href: "/agency/integrations", label: "Integrations", section: "Agency" },
  { href: "/agency/settings", label: "SaaS / white label", section: "Agency" },
];

export default async function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organization } = await requireAgency();
  return (
    <AppShell
      brand={organization.name}
      subtitle="Agency OS"
      nav={nav}
    >
      {children}
    </AppShell>
  );
}
