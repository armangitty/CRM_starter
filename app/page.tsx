import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";

function IconArrowUpRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

function IconMoveRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M18 8L22 12L18 16" />
      <path d="M2 12H22" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconArrowDownRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m7 7 10 10" />
      <path d="M17 7v10H7" />
    </svg>
  );
}

const pipeline = [
  { n: "01", title: "Capture", body: "Ad clicks, forms, and direct mail" },
  { n: "02", title: "Qualify", body: "One view of intent and follow-up" },
  { n: "03", title: "Book", body: "A confirmed conversation on the calendar" },
];

const workflow = [
  {
    n: "01",
    title: "Capture the whole signal",
    body: "Bring Facebook and Instagram ads, TikTok, Google, Klaviyo, and direct-mail responses into one lead-generation workflow.",
  },
  {
    n: "02",
    title: "Make follow-up obvious",
    body: "Keep ownership, context, and next steps attached to the lead instead of buried in disconnected inboxes and spreadsheets.",
  },
  {
    n: "03",
    title: "Measure what becomes real",
    body: "Connect Calendly and Stripe to see the useful finish line: qualified leads, booked calls, and the conversion path behind them.",
  },
];

const connections = [
  "Meta Ads",
  "Instagram",
  "TikTok Ads",
  "Google Ads",
  "Klaviyo",
  "Calendly",
  "Stripe",
  "Direct mail",
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col overflow-hidden">
      <MarketingHeader />
      <main className="overflow-hidden">
        <section className="relative border-b border-border" aria-labelledby="hero-heading">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-gradient-to-br from-brand-100/70 via-background to-background" />
          <div className="container-page grid gap-14 py-section-lg lg:grid-cols-[minmax(0,0.82fr)_minmax(34rem,1.18fr)] lg:items-center lg:gap-20">
            <div className="max-w-xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3 text-primary" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="1" />
                </svg>
                Lead-to-booking CRM
              </div>
              <h1 id="hero-heading" className="font-display text-display max-w-2xl tracking-tight">
                Turn demand into <span className="text-primary">booked conversations.</span>
              </h1>
              <p className="mt-7 max-w-lg text-body-lg text-muted-foreground">
                Leadport gives growth teams one clear path from the first ad impression
                to the phone call on the calendar—with a client portal that looks like yours.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/#contact" className="btn h-12 px-6">
                  Start a conversation
                  <IconArrowUpRight className="size-4" />
                </Link>
                <Link href="/#workflow" className="btn-secondary h-12 px-6">
                  See the handoff
                  <IconMoveRight className="size-4" />
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-3 text-small text-muted-foreground">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <IconCheck className="size-4" />
                </span>
                Built for agencies and modern growth teams
              </div>
            </div>

            <div className="relative lg:translate-y-5">
              <div className="absolute -inset-5 rounded-[2rem] border border-primary/15 bg-primary/5" />
              <div className="absolute -right-3 -top-8 hidden rounded-full border border-border bg-background px-4 py-2 text-caption font-medium shadow-sm sm:block">
                <span className="mr-2 inline-block size-2 rounded-full bg-primary align-middle" />
                Live pipeline view
              </div>
              <div className="relative overflow-hidden rounded-[1.5rem] border border-primary/20 bg-card shadow-xl">
                <div className="border-b border-border bg-muted/35 px-5 py-4 sm:px-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-caption font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Leadport / pipeline
                      </p>
                      <p className="mt-1 font-display text-h4 font-semibold tracking-tight">
                        The path to booked
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      This week
                    </span>
                  </div>
                </div>
                <div className="px-5 py-6 sm:px-7 sm:py-8">
                  <div className="relative">
                    <div className="absolute top-7 bottom-7 left-[1.05rem] w-px bg-border" />
                    {pipeline.map((step, index) => (
                      <div key={step.n} className="group relative flex gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="z-10 flex size-[2.15rem] shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background text-caption font-semibold text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                          {step.n}
                        </div>
                        <div
                          className={`flex min-w-0 flex-1 items-center justify-between gap-4 ${
                            index === pipeline.length - 1
                              ? ""
                              : "border-b border-border/70 pb-4"
                          }`}
                        >
                          <div>
                            <p className="font-display text-h4 leading-none">{step.title}</p>
                            <p className="mt-2 text-small text-muted-foreground">{step.body}</p>
                          </div>
                          <IconChevron className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-muted/60 p-4">
                      <p className="text-caption uppercase tracking-[0.08em] text-muted-foreground">
                        Booked calls
                      </p>
                      <p className="mt-2 font-display text-h2 leading-none">284</p>
                      <p className="mt-2 flex items-center gap-1 text-caption text-primary">
                        <IconArrowUpRight className="size-3" />
                        18.4% vs last month
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-caption uppercase tracking-[0.08em] text-muted-foreground">
                        Lead response
                      </p>
                      <p className="mt-2 font-display text-h2 leading-none">12m</p>
                      <p className="mt-2 text-caption text-muted-foreground">
                        Across every source
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-muted/25" aria-label="Leadport positioning">
          <div className="container-page flex flex-col gap-4 py-5 text-small sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium">One pipeline for every way a lead finds you.</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
              <span>Paid social</span>
              <span className="text-primary">/</span>
              <span>Search</span>
              <span className="text-primary">/</span>
              <span>Email</span>
              <span className="text-primary">/</span>
              <span>Direct mail</span>
            </div>
          </div>
        </section>

        <section id="workflow" className="section-lg scroll-mt-20" aria-labelledby="workflow-heading">
          <div className="container-page grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-eyebrow">The operating view</p>
              <h2 id="workflow-heading" className="mt-4 max-w-md font-display text-h1 tracking-tight">
                Less platform. More momentum.
              </h2>
              <p className="mt-5 max-w-sm text-body-lg text-muted-foreground">
                Leadport keeps the important handoffs visible, so your team can spend
                less time stitching tools together and more time moving the next lead forward.
              </p>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {workflow.map((item) => (
                <article
                  key={item.n}
                  className="group grid gap-5 py-8 sm:grid-cols-[5rem_1fr_auto] sm:items-start"
                >
                  <span className="font-display text-h3 text-primary">{item.n}</span>
                  <div>
                    <h3 className="font-display text-h3 tracking-tight">{item.title}</h3>
                    <p className="mt-3 max-w-xl text-muted-foreground">{item.body}</p>
                  </div>
                  <IconArrowDownRight className="hidden size-5 text-primary transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1 sm:block" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="portal"
          className="scroll-mt-20 bg-primary text-primary-foreground"
          aria-labelledby="portal-heading"
        >
          <div className="container-page grid gap-12 py-section-lg lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-24">
            <div>
              <p className="text-eyebrow text-primary-foreground/70">The client-facing layer</p>
              <h2 id="portal-heading" className="mt-4 max-w-xl font-display text-h1 tracking-tight">
                Your brand on the other side of the booking.
              </h2>
              <p className="mt-5 max-w-lg text-body-lg text-primary-foreground/75">
                Give customers a portal that feels like an extension of your business.
                They can log in, see their schedule, and manage phone-call bookings
                without seeing the machinery behind it.
              </p>
              <div className="mt-8 flex flex-wrap gap-2 text-small text-primary-foreground/80">
                {["Branded login", "Schedule visibility", "Booking management"].map((chip) => (
                  <span key={chip} className="rounded-full border border-primary-foreground/25 px-3 py-1.5">
                    {chip}
                  </span>
                ))}
              </div>
              <Link href="/login" className="btn-secondary mt-8 h-9 bg-secondary px-5 text-sm text-secondary-foreground">
                Open your workspace
                <IconArrowUpRight className="size-4" />
              </Link>
            </div>
            <div className="relative">
            <div className="absolute -inset-4 rounded-[1.5rem] border border-primary-foreground/15" />
            <div className="relative overflow-hidden rounded-[1.25rem] border border-primary-foreground/20 bg-background text-foreground shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
                    P
                  </span>
                  <span className="font-display font-semibold">Northline Studio</span>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                  Client portal
                </span>
              </div>
              <div className="grid gap-5 p-5 sm:p-7">
                <div>
                  <p className="text-caption uppercase tracking-[0.1em] text-muted-foreground">
                    Tuesday, October 14
                  </p>
                  <p className="mt-1 font-display text-h3">Your upcoming conversations</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/35 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-caption font-medium text-primary">10:30 — 11:00</p>
                      <p className="mt-1 font-medium">Growth planning call</p>
                      <p className="mt-1 text-small text-muted-foreground">With Avery Morgan</p>
                    </div>
                    <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold">
                      Confirmed
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4 text-small">
                  <span className="text-muted-foreground">Need another time?</span>
                  <Link href="/login" className="flex items-center gap-1 font-medium text-primary">
                    Manage booking
                    <IconChevron className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        <section id="integrations" className="section scroll-mt-20" aria-labelledby="integrations-heading">
          <div className="container-page grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <div>
              <p className="text-eyebrow">The connected stack</p>
              <h2 id="integrations-heading" className="mt-4 max-w-md font-display text-h2 tracking-tight">
                Keep your sources. Lose the scramble.
              </h2>
              <p className="mt-5 max-w-sm text-muted-foreground">
                Leadport gives the tools you already use a shared destination: one place
                to see which campaigns create conversations, not just clicks.
              </p>
            </div>
            <div className="overflow-hidden rounded-[1.25rem] border border-border bg-card shadow">
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
                {connections.map((name, i) => (
                  <div
                    key={name}
                    className="group flex min-h-28 flex-col justify-between bg-card p-4 transition-colors duration-200 hover:bg-muted sm:p-5"
                  >
                    <span className="flex size-7 items-center justify-center rounded-md border border-border text-caption font-semibold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-6 text-small font-medium transition-colors group-hover:text-primary">
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-20 px-gutter pb-section-lg" aria-labelledby="contact-heading">
          <div className="container-page">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-muted/45 px-6 py-12 sm:px-12 sm:py-16">
              <div className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full border-[3rem] border-primary/10" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-eyebrow">Ready when you are</p>
                  <h2 id="contact-heading" className="mt-4 max-w-2xl font-display text-h1 tracking-tight">
                    Give every lead a clearer next step.
                  </h2>
                  <p className="mt-5 max-w-xl text-body-lg text-muted-foreground">
                    Tell us how your team turns demand into conversations. We’ll show you
                    where Leadport can make the handoff simpler.
                  </p>
                </div>
                <Link href="/signup" className="btn h-12 px-6">
                  Start a conversation
                  <IconArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
