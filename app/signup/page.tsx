import Link from "next/link";
import { signUpAgency } from "@/app/actions/auth";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="flex min-h-full flex-col">
      <MarketingHeader />
      <main className="relative flex flex-1 items-center justify-center px-5 py-16">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-[-30%] left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-brand-100 opacity-40 blur-3xl" />
        </div>
        <div className="surface relative w-full max-w-md shadow-sm">
          <div className="p-6 pb-2 text-center">
            <h1 className="font-display text-3xl tracking-tight">Create your agency</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add client companies and issue portal logins from the dashboard.
            </p>
          </div>
          <form action={signUpAgency} className="space-y-4 p-6 pt-4">
            {params.error ? (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                {params.error}
              </p>
            ) : null}
            <div>
              <label htmlFor="agency_name">Agency name</label>
              <input id="agency_name" name="agency_name" required />
            </div>
            <div>
              <label htmlFor="full_name">Your name</label>
              <input id="full_name" name="full_name" required />
            </div>
            <div>
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password" minLength={8} required />
            </div>
            <button type="submit" className="w-full">
              Create agency
            </button>
            <p className="text-center text-sm text-muted-foreground">
              Already have access?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
