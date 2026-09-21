import Link from "next/link";
import { signUpAgency } from "@/app/actions/auth";
import { MarketingFooter, MarketingHeader } from "@/components/marketing-header";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; checkEmail?: string }>;
}) {
  const params = await searchParams;
  if (params.checkEmail) {
    return (
      <div className="flex min-h-full flex-col">
        <MarketingHeader />
        <main className="relative flex flex-1 items-center justify-center px-5 py-16">
          <div className="surface relative w-full max-w-md p-8 text-center shadow-sm">
            <h1 className="font-display text-3xl tracking-tight">Check your email</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Confirm the link we sent, then sign in. Your agency is created after
              that confirmation, the same way a GoHighLevel workspace starts.
            </p>
            <Link href="/login" className="btn mt-8 h-12 w-full">
              Continue to sign in
            </Link>
          </div>
        </main>
        <MarketingFooter />
      </div>
    );
  }
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
              We’ll email you a confirmation link. After you confirm, sign in and
              your agency workspace opens. Client logins are issued by you, not
              created by customers.
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
