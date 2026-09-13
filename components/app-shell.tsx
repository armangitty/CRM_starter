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
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/5 bg-[#10151c]">
        <div className="px-4 py-6">
          <Link href="/" className="px-2">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80">
              Leadport
            </p>
            <p className="mt-1 font-semibold text-white">{brand}</p>
            <p className="mt-1 text-xs text-stone-500">{subtitle}</p>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 pb-6">
          {nav.map((item) => {
            const showSection = item.section && item.section !== lastSection;
            lastSection = item.section ?? lastSection;
            return (
              <div key={item.href}>
                {showSection ? (
                  <p className="mt-4 mb-1 px-3 text-[10px] uppercase tracking-[0.18em] text-stone-600">
                    {item.section}
                  </p>
                ) : null}
                <Link
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-white/5 hover:text-white"
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-white/5 px-4 py-4">
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
          ? "border-red-500/30 bg-red-500/10 text-red-200"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
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
    <div className="rounded-2xl border border-white/5 bg-[#141b24] p-5">
      <p className="text-xs uppercase tracking-wider text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}
