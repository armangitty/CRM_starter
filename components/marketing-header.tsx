import Link from "next/link";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-14 max-w-screen-xl items-center gap-2 px-4"
      >
        <Link href="/" className="mr-2 shrink-0 truncate text-base font-semibold tracking-tight">
          Leadport
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {[
            ["/#workflow", "Workflow"],
            ["/#portal", "Client portal"],
            ["/#integrations", "Connections"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium hover:bg-accent"
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium hover:bg-accent"
          >
            Sign in
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border">
      <nav aria-label="Footer" className="mx-auto flex max-w-screen-xl flex-wrap items-center gap-1 px-4 py-6 text-sm">
        <Link href="/#contact" className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-primary underline-offset-4 hover:underline">
          Contact
        </Link>
        <Link href="/login" className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </nav>
    </footer>
  );
}
