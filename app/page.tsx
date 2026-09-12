import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <p className="text-xs uppercase tracking-[0.28em] text-amber-500/90">
          Leadport
        </p>
        <div className="flex gap-4 text-sm">
          <Link href="/login" className="text-stone-300 hover:text-white">
            Sign in
          </Link>
          <Link href="/signup" className="btn">
            Start agency
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-8 pb-24">
        <p className="text-sm text-amber-500/80">Agency OS for ads, leads, and bookings</p>
        <h1 className="font-display mt-4 max-w-3xl text-5xl leading-tight text-white md:text-6xl">
          Run Facebook ads for clients. Show every lead and booking in their portal.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-400">
          Leadport is a GoHighLevel-style sub-account CRM: you operate the agency,
          each company gets a login, and Meta lead ads plus the booking page land
          in the same pipeline.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/signup" className="btn">
            Create your agency
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-white/10 px-5 py-3 text-sm text-stone-200"
          >
            Client portal login
          </Link>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Sub-accounts",
              body: "One workspace per client company, isolated leads and calendars.",
            },
            {
              title: "Facebook leads",
              body: "Webhook from Meta Lead Ads creates contacts the moment a form is submitted.",
            },
            {
              title: "Client portal",
              body: "You issue email + password. They see leads, opportunities, and bookings.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/5 bg-[#141b24] p-5"
            >
              <h2 className="text-lg text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-400">{item.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
