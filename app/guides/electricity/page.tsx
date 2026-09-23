import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";

export const metadata: Metadata = {
  title: "Electricity from heat, copper, and water",
  description:
    "A short educational booklet on converting fire, copper, water, and motion into low-voltage electricity.",
};

const PDF_HREF = "/Electricity-from-Heat-Copper-Water.pdf";

export default function ElectricityGuidePage() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto w-full max-w-screen-md flex-1 px-4 py-12">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">Field booklet</p>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Electricity from heat, copper, water, and motion
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Low-voltage experiments only. This is energy conversion, not “free power from nowhere,”
          and it is not a guide to wiring a house or tapping the grid.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <a
            href={PDF_HREF}
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            Open PDF
          </a>
          <a
            href={PDF_HREF}
            download
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium hover:bg-accent"
          >
            Download
          </a>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium hover:bg-accent"
          >
            Back home
          </Link>
        </div>
        <div className="mt-8 overflow-hidden rounded-lg border border-border bg-card">
          <iframe
            title="Electricity booklet"
            src={`${PDF_HREF}#view=FitH`}
            className="h-[80vh] w-full"
          />
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
