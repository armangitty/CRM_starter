import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function AppShell({
  brand,
  subtitle,
  nav,
  children,
}: {
  brand: string;
  subtitle: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <aside className="flex w-60 shrink-0 flex-col border-r border-white/5 bg-[#10151c] px-4 py-6">
        <Link href="/" className="px-2">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80">
            Leadport
          </p>
          <p className="mt-1 font-semibold text-white">{brand}</p>
          <p className="mt-1 text-xs text-stone-500">{subtitle}</p>
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-stone-300 hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
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
