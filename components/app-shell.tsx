import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export type NavItem = { href: string; label: string; section?: string };

export function AppShell({
  brand,
  subtitle,
  nav,
  children,
}: {
  brand: string;
  subtitle: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  let lastSection = "";
  return (
    <div className="flex min-h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="px-4 py-6">
          <Link href="/" className="px-2">
            <p className="text-xs font-semibold tracking-tight text-primary">Leadport</p>
            <p className="mt-1 font-display text-lg font-semibold">{brand}</p>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 pb-6">
          {nav.map((item) => {
            const showSection = item.section && item.section !== lastSection;
            lastSection = item.section ?? lastSection;
            return (
              <div key={item.href}>
                {showSection ? (
                  <p className="mt-4 mb-1 px-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {item.section}
                  </p>
                ) : null}
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-border px-4 py-4">
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto px-8 py-8">{children}</main>
    </div>
  );
}

export function Flash({
  ok,
  error,
}: {
  ok?: string;
  error?: string;
}) {
  if (!ok && !error) return null;
  return (
    <div
      className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
        error
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {error || ok}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="surface p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
